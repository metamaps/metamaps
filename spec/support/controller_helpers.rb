# https://github.com/plataformatec/devise/wiki/How-To:-Stub-authentication-in-controller-specs
module ControllerHelpers
  def sign_in(user = create(:user))
    if user.nil?
      # simulate unauthenticated
      allow(request.env['warden']).to receive(:authenticate!).and_throw(:warden, scope: :user)
      allow(controller).to receive(:current_user).and_return(nil)
    else
      # simulate authenticated
      allow(request.env['warden']).to receive(:authenticate!).and_return(user)
      allow(controller).to receive(:current_user).and_return(user)
    end
  end
end
