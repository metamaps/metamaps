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
          topic1: { attr: :node1, serializer: TopicSerializer },
          topic2: { attr: :node2, serializer: TopicSerializer },
          user: {}
        }
      end

      self.class_eval do
        embed_dat
      end
    end
  end
end
