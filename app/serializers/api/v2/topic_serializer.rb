# frozen_string_literal: true

module Api
  module V2
    class TopicSerializer < ApplicationSerializer
      attributes :id,
                 :name,
                 :desc,
                 :link,
                 :permission,
                 :created_at,
                 :updated_at

      def self.embeddable
        {
          user: {},
          metacode: {},
          attachments: {}
        }
      end

      class_eval do
        embed_dat
      end
    end
  end
end
