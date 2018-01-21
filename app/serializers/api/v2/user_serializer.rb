# frozen_string_literal: true

module Api
  module V2
    class UserSerializer < ApplicationSerializer
      attributes :id,
                 :name,
                 :avatar,
                 :generation

      attribute :is_admin,
                if: -> { scope[:show_full_user] && scope[:current_user] == object }
      attribute :email,
                if: -> { scope[:show_full_user] && scope[:current_user] == object }

      def avatar
        object.image.url(:sixtyfour)
      end

      def is_admin
        object.admin
      end
      # rubocop:enable Style/PredicateName
    end
  end
end
