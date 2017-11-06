# frozen_string_literal: true

module Users
  class SessionsController < Devise::SessionsController
    after_action :store_location, only: [:new]

    protected

    def after_sign_in_path_for(resource)
      stored = stored_location_for(User)
      return stored if stored

      if request.referer&.match(sign_in_url) || request.referer&.match(sign_up_url)
        super
      else
        request.referer || root_path
      end
    end

    private

    def store_location
      store_location_for(User, params[:redirect_to]) if params[:redirect_to]
    end
  end
end
