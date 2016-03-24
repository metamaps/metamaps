# https://github.com/plataformatec/devise/wiki/How-To:-Stub-authentication-in-controller-specs
module ControllerHelpers
  # rubocop:disable Metrics/AbcSize
  def sign_in(user = create(:user))
    if user.nil? # simulate unauthenticated
      allow(request.env['warden']).to(
        receive(:authenticate!).and_throw(:warden, scope: :user)
      )
    else # simulate authenticated
      allow(request.env['warden']).to(
        receive(:authenticate!).and_return(user)
      )
    end
    allow(controller).to receive(:current_user).and_return(user)
  end
  # rubocop:enable Metrics/AbcSize
end
