# frozen_string_literal: true
module Api
  module V2
    class RestfulController < ActionController::Base
      include Pundit
      include PunditExtra

      protect_from_forgery with: :exception
      snorlax_used_rest!

      before_action :load_resource, only: [:show, :update, :destroy]
      after_action :verify_authorized

      def index
        authorize resource_class
        instantiate_collection
        respond_with_collection
      end

      def create
        instantiate_resource
        resource.user = current_user if current_user.present?
        authorize resource
        create_action
        respond_with_resource
      end

      def destroy
        destroy_action
        head :no_content
      end

      def catch_404
        skip_authorization
        render json: { error: '404 Not found' }, status: :not_found
      end

      private

      def accessible_records
        if current_user
          visible_records
        else
          public_records
        end
      end

      def current_user
        token_user || doorkeeper_user || super
      end

      def load_resource
        super
        authorize resource
      end

      def resource_serializer
        "Api::V2::#{resource_name.camelize}Serializer".constantize
      end

      def respond_with_resource(scope: default_scope, serializer: resource_serializer,
                                root: serializer_root)
        if resource.errors.empty?
          render json: resource, scope: scope, serializer: serializer, root: root
        else
          respond_with_errors
        end
      end

      def respond_with_collection(resources: collection, scope: default_scope,
                                  serializer: resource_serializer, root: serializer_root)
        pagination_link_headers!(pagination(resources))
        render json: resources, scope: scope, each_serializer: serializer, root: root,
               meta: pagination(resources), meta_key: :page
      end

      def default_scope
        {
          embeds: embeds,
          current_user: current_user
        }
      end

      def embeds
        (params[:embed] || '').split(',').map(&:to_sym)
      end

      def token_user
        token = params[:access_token]
        access_token = Token.find_by_token(token)
        @token_user ||= access_token.user if access_token
      end

      def doorkeeper_user
        return unless doorkeeper_token.present?
        doorkeeper_render_error unless valid_doorkeeper_token?
        @doorkeeper_user ||= User.find(doorkeeper_token.resource_owner_id)
      end

      def permitted_params
        @permitted_params ||= PermittedParams.new(params)
      end

      def serializer_root
        'data'
      end

      def pagination(collection)
        return @pagination_data unless @pagination_data.nil?

        current_page = (params[:page] || 1).to_i
        per = (params[:per] || 25).to_i
        total_pages = (collection.total_count.to_f / per).ceil
        @pagination_data = {
          current_page: current_page,
          next_page: current_page < total_pages ? current_page + 1 : 0,
          prev_page: current_page > 1 ? current_page - 1 : 0,
          total_pages: total_pages,
          total_count: collection.total_count,
          per: per
        }
      end

      def pagination_link_headers!(data)
        base_url = request.base_url + request.path
        old_query = request.query_parameters
        nxt = old_query.merge(page: data[:next_page]).map { |x| x.join('=') }.join('&')
        prev = old_query.merge(page: data[:prev_page]).map { |x| x.join('=') }.join('&')
        last = old_query.merge(page: data[:total_pages]).map { |x| x.join('=') }.join('&')

        response.headers['Link'] = [
          %(<#{base_url}?#{nxt}>; rel="next"),
          %(<#{base_url}?#{prev}>; rel="prev"),
          %(<#{base_url}?#{last}>; rel="last")
        ].join(',')
        response.headers['X-Total-Pages'] = data[:total_pages].to_s
        response.headers['X-Total-Count'] = data[:total_count].to_s
        response.headers['X-Per-Page'] = data[:per].to_s
      end

      def instantiate_collection
        collection = accessible_records
        collection = yield collection if block_given?
        collection = search_by_q(collection) if params[:q]
        collection = apply_filters(collection)
        collection = order_by_sort(collection) if params[:sort]
        collection = collection.page(params[:page]).per(params[:per])
        self.collection = collection
      end

      # override this method to explicitly set searchable columns
      def searchable_columns
        columns = resource_class.columns.select do |column|
          column.type == :text || column.type == :string
        end
        columns.map(&:name)
      end

      # thanks to http://stackoverflow.com/questions/4430578
      def search_by_q(collection)
        table = resource_class.arel_table
        safe_query = "%#{params[:q].gsub(/[%_]/, '\\\\\0')}%"
        search_column = -> (column) { table[column].matches(safe_query) }

        condition = searchable_columns.reduce(nil) do |prev, column|
          next search_column.call(column) if prev.nil?
          search_column.call(column).or(prev)
        end
        collection.where(condition)
      end

      def apply_filters(collection)
        # override this function for specific filters
        collection
      end

      def order_by_sort(collection)
        builder = collection
        sorts = params[:sort].split(',')
        sorts.each do |sort|
          direction = sort.starts_with?('-') ? 'desc' : 'asc'
          sort = sort.sub(/^-/, '')
          if resource_class.columns.map(&:name).include?(sort)
            builder = builder.order(sort => direction)
          end
        end
        builder
      end

      def visible_records
        policy_scope(resource_class)
      end

      def public_records
        policy_scope(resource_class)
      end
    end
  end
end
