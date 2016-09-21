module Api
  module V2
    class MapSerializer < ApplicationSerializer
      attributes :id,
        :name,
        :desc,
        :permission,
        :screenshot,
        :created_at,
        :updated_at

      def self.embeddable
        {
          user: {},
          topics: {},
          synapses: {},
          mappings: {},
          contributors: { serializer: UserSerializer },
          collaborators: { serializer: UserSerializer }
        }
      end

      self.class_eval do
        embed_dat
      end
    end
  end
end
