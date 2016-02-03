require 'uservoice-ruby'

def current_sso_token
	@current_sso_token ||= UserVoice.generate_sso_token('metamapscc', ENV['SSO_KEY'], {
      :email => current_user.email
    }, 300) # Default expiry time is 5 minutes = 300 seconds
end