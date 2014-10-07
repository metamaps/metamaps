require 'uservoice-ruby'

SSO_KEY = '3f0d5e3bbaff5ea7c95e549f75ebba8c'

def current_sso_token
    @current_sso_token ||= UserVoice.generate_sso_token('metamapscc', SSO_KEY, {
      :email => current_user.email
    }, 300) # Default expiry time is 5 minutes = 300 seconds
end