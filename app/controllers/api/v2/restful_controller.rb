module Api
  module V2
    class RestfulController < ActionController::Base
      include Pundit
      include PunditExtra

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

      private

      def accessible_records
        if current_user
          visible_records
        else
          public_records
        end
      end

      def current_user
        super || token_user || doorkeeper_user || nil
      end

      def load_resource
        super
        authorize resource
      end

      def resource_serializer
        "Api::V2::#{resource_name.camelize}Serializer".constantize
      end

      def respond_with_resource(scope: default_scope, serializer: resource_serializer, root: serializer_root)
        if resource.errors.empty?
          render json: resource, scope: scope, serializer: serializer, root: root
        else
          respond_with_errors
        end
      end

      def respond_with_collection(resources: collection, scope: default_scope, serializer: resource_serializer, root: serializer_root)
        render json: resources, scope: scope, each_serializer: serializer, root: root, meta: pagination(resources), meta_key: :page
      end

      def default_scope
        {
          embeds: embeds
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
        per = (params[:per] || 25).to_i
        current_page = (params[:page] || 1).to_i
        total_pages = (collection.total_count.to_f / per).ceil
        prev_page = current_page > 1 ? current_page - 1 : 0
        next_page = current_page < total_pages ? current_page + 1 : 0

        base_url = request.base_url + request.path
        nxt = request.query_parameters.merge(page: next_page).map{|x| x.join('=')}.join('&')
        prev = request.query_parameters.merge(page: prev_page).map{|x| x.join('=')}.join('&')
        last = request.query_parameters.merge(page: total_pages).map{|x| x.join('=')}.join('&')
        response.headers['Link'] = [
          %(<#{base_url}?#{nxt}>; rel="next"),
          %(<#{base_url}?#{prev}>; rel="prev"),
          %(<#{base_url}?#{last}>; rel="last")
        ].join(',')
        response.headers['X-Total-Pages'] = collection.total_pages.to_s
        response.headers['X-Total-Count'] = collection.total_count.to_s
        response.headers['X-Per-Page'] = per.to_s

        {
          current_page: current_page,
          next_page: next_page,
          prev_page: prev_page,
          total_pages: total_pages,
          total_count: collection.total_count,
          per: per
        }
      end

      def instantiate_collection
        collection = accessible_records
        collection = yield collection if block_given?
        collection = search_by_q(collection) if params[:q]
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
          next search_column.(column) if prev.nil?
          search_column.(column).or(prev)
        end
        puts collection.where(condition).to_sql
        collection.where(condition)
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
        return builder
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
