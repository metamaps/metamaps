# frozen_string_literal: true
module Api
  module V2
    class UserSerializer < ApplicationSerializer
      attributes :id,
                 :name,
                 :avatar,
                 :is_admin,
                 :generation

      def avatar
        object.image.url(:sixtyfour)
      end

      # rubocop:disable Style/PredicateName
      def is_admin
        object.admin
      end
      # rubocop:enable Style/PredicateName
    end
  end
end
