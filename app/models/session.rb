class Session < Authlogic::Session::Base

  authenticate_with User

end
