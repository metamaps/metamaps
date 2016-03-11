class LoggedOutUser

  FALSE_METHODS = [:is_logged_in?]

  FALSE_METHODS.each { |method| define_method(method, -> { false }) }

end
