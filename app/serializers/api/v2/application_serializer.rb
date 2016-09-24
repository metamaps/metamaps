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

      # self.embeddable might look like this:
      #   topic1: { attr: :node1, serializer: TopicSerializer }
      #   topic2: { attr: :node2, serializer: TopicSerializer }
      #   contributors: { serializer: UserSerializer}
      # This method will remove the :attr key if the underlying attribute name
      # is different than the name provided in the final json output. All other keys
      # in the hash will be passed to the ActiveModel::Serializer `attribute` method
      # directly (e.g. serializer in the examples will be passed).
      #
      # This setup means if you passed this self.embeddable config and sent no
      # ?embed= query param with your API request, you would get the regular attributes
      # plus topic1_id, topic2_id, and contributor_ids. If you pass
      # ?embed=topic1,topic2,contributors, then instead of two ids and an array of ids,
      # you would get two serialized topics and an array of serialized users
      def self.embed_dat
        embeddable.each_pair do |key, opts|
          attr = opts.delete(:attr) || key
          if attr.to_s.pluralize == attr.to_s
            attribute("#{attr.to_s.singularize}_ids".to_sym,
                      opts.merge(unless: -> { embeds.include?(key) })) do
              object.send(attr).map(&:id)
            end
            has_many(attr, opts.merge(if: -> { embeds.include?(key) }))
          else
            id_opts = opts.merge(key: "#{key}_id")
            attribute("#{attr}_id".to_sym,
                      id_opts.merge(unless: -> { embeds.include?(key) }))
            attribute(key, opts.merge(if: -> { embeds.include?(key) }))
          end
        end
      end
    end
  end
end
