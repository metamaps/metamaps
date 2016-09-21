module Api
  module V2
    class MappingSerializer < ApplicationSerializer
      attributes :id,
        :created_at,
        :updated_at,
        :mappable_id,
        :mappable_type

      attribute :xloc, if: -> { object.mappable_type == 'Topic' }
      attribute :yloc, if: -> { object.mappable_type == 'Topic' }

      def self.embeddable
        {
          user: {},
          map: {}
        }
      end

      self.class_eval do
        embed_dat
      end
    end
  end
end
