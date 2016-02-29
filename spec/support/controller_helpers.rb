# https://github.com/plataformatec/devise/wiki/How-To:-Stub-authentication-in-controller-specs

require 'devise'

module ControllerHelpers
  # rubocop:disable Metrics/AbcSize
  def sign_in(user = create(:user))
    if user.nil? # simulate unauthenticated
      allow(request.env['warden']).to(
        receive(:authenticate!).and_throw(:warden, scope: :user)
      )
    else # simulate authenticated
      allow_message_expectations_on_nil
      allow(request.env['warden']).to(
        receive(:authenticate!).and_return(user)
      )
    end
    allow(controller).to receive(:current_user).and_return(user)
  end
  # rubocop:enable Metrics/AbcSize
end

RSpec.configure do |config|
  config.include Devise::TestHelpers, :type => :controller
  config.include ControllerHelpers, :type => :controller
end
