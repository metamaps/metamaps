module Api
  module V2
    class ApplicationSerializer < ActiveModel::Serializer
      def self.embeddable
        {}
      end

      def embeds
        @embeds ||= (scope[:embeds] || []).select { |e| self.class.embeddable.keys.include?(e) }
      end

      def self.embed_dat
        embeddable.each_pair do |key, opts|
          attr = opts.delete(:attr) || key
          if attr.to_s.pluralize == attr.to_s
            attribute "#{attr.to_s.singularize}_ids".to_sym, opts.merge(unless: -> { embeds.include?(key) }) do
              object.send(attr).map(&:id)
            end
            has_many attr, opts.merge(if: -> { embeds.include?(key) })
          else
            id_opts = opts.merge(key: "#{key}_id")
            attribute "#{attr}_id".to_sym, id_opts.merge(unless: -> { embeds.include?(key) })
            attribute key, opts.merge(if: -> { embeds.include?(key) })
          end
        end
      end
    end
  end
end
