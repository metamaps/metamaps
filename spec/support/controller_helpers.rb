# https://github.com/plataformatec/devise/wiki/How-To:-Stub-authentication-in-controller-specs

require 'devise'

module ControllerHelpers
  extend ActiveSupport::Concern

  included do
    include Devise::Test::ControllerHelpers
  end

  def comparable(model)
    model.attributes.except('id', 'created_at', 'updated_at')
  end
end

RSpec.configure do |config|
  config.include ControllerHelpers, type: :controller
end
