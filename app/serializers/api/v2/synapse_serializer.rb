# frozen_string_literal: true

module Api
  module V2
    class SynapseSerializer < ApplicationSerializer
      attributes :id,
                 :desc,
                 :category,
                 :permission,
                 :created_at,
                 :updated_at

      def self.embeddable
        {
          topic1: { serializer: TopicSerializer },
          topic2: { serializer: TopicSerializer },
          user: {}
        }
      end

      class_eval do
        embed_dat
      end
    end
  end
end
