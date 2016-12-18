# frozen_string_literal: true
module Api
  module V2
    class MapSerializer < ApplicationSerializer
      attributes :id,
                 :name,
                 :desc,
                 :permission,
                 :screenshot,
                 :starred,
                 :created_at,
                 :updated_at

      def starred
        object.starred_by_user?(scope[:current_user])
      end

      def self.embeddable
        {
          user: {},
          source: {},
          topics: {},
          synapses: {},
          mappings: {},
          contributors: { serializer: UserSerializer },
          collaborators: { serializer: UserSerializer }
        }
      end

      class_eval do
        embed_dat
      end
    end
  end
end
