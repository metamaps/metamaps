# frozen_string_literal: true
module Api
  module V2
    class ApplicationSerializer < ActiveModel::Serializer
      def self.embeddable
        {}
      end

      def embeds
        # subclasses can override self.embeddable, and then it will whitelist
        # scope[:embeds] based on the contents. That way scope[:embeds] can just pull
        # from params and the whitelisting happens here
        @embeds ||= (scope[:embeds] || []).select { |e| self.class.embeddable.keys.include?(e) }
      end

      # Here's an example object that could be passed in self.embeddable: {
      #   creator: {
      #     serializer: UserSerializer,
      #   },
      #   collaborators: {
      #     serializer: UserSerializer
      #   },
      #   topic: {},
      #   synapses: {}
      # }
      # The key has to be in embeddable or it won't show in the response, and the serializer is
      # only needed if the key doesn't match a serializer
      def self.embed_dat
        embeddable.each_pair do |key, opts|
          is_plural = key.to_s.pluralize == key.to_s
          id_key = key.to_s.singularize + (is_plural ? '_ids' : '_id')
          serializer = opts.delete(:serializer) || "Api::V2::#{key.to_s.singularize.camelize}Serializer".constantize
          if is_plural
            attribute(id_key.to_sym, opts.merge(unless: -> { embeds.include?(key) })) do
              Pundit.policy_scope(scope[:current_user], object.send(key))&.map(&:id) || []
            end
            has_many(key, opts.merge(if: -> { embeds.include?(key) })) do
              list = Pundit.policy_scope(scope[:current_user], object.send(key)) || []
              resource = ActiveModelSerializers::SerializableResource.new(
                list,
                each_serializer: serializer,
                scope: scope.merge(embeds: [])
              )
              # resource.as_json will return e.g. { users: [ ... ] } for collaborators
              # since we can't get the :users key, convert to an array and use .first.second to get the needed values
              resource&.as_json&.to_a&.first&.second
            end
          else
            attribute(id_key.to_sym, opts.merge(unless: -> { embeds.include?(key) }))
            attribute(key, opts.merge(if: -> { embeds.include?(key) })) do |parent_serializer|
              object = parent_serializer.object.send(key)
              next nil if object.nil?
              resource = ActiveModelSerializers::SerializableResource.new(
                object,
                serializer: serializer,
                scope: scope.merge(embeds: [])
              )
              resource&.as_json&.to_a&.first&.second
            end
          end
        end
      end
    end
  end
end
