require_relative 'boot'

require 'csv'
require 'rails/all'

Bundler.require(*Rails.groups)

module Metamaps
  class Application < Rails::Application
    config.active_job.queue_adapter = :delayed_job
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Custom directories with classes and modules you want to be autoloadable.
    config.autoload_paths << Rails.root.join('app', 'services')

    # Configure the default encoding used in templates for Ruby 1.9.
    config.encoding = 'utf-8'

    config.to_prepare do
      Doorkeeper::ApplicationsController.layout 'doorkeeper'
      Doorkeeper::AuthorizationsController.layout 'doorkeeper'
      Doorkeeper::AuthorizedApplicationsController.layout 'doorkeeper'
      Doorkeeper::ApplicationController.helper ApplicationHelper
    end

    # Configure sensitive parameters which will be filtered from the log file.
    config.filter_parameters += [:password]

    # Enable the asset pipeline
    config.assets.initialize_on_precompile = false

    # Version of your assets, change this if you want to expire all your assets
    config.assets.version = '2.0'

    config.generators do |g|
      g.test_framework :rspec
    end

    # pundit errors return 403 FORBIDDEN
    config.action_dispatch.rescue_responses['Pundit::NotAuthorizedError'] = :forbidden
  end
end
