# frozen_string_literal: true

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb

  config.log_level = :info
  config.eager_load = false

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Show full error reports and disable caching
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false

  config.action_mailer.delivery_method = :file
  config.action_mailer.file_settings = {
    location: 'tmp/mails'
  }
  config.action_mailer.default_url_options = { host: 'localhost:3000' }
  config.action_mailer.raise_delivery_errors = true

  # Print deprecation notices to the Rails logger
  config.active_support.deprecation = :log

  config.action_mailer.preview_path = "#{Rails.root}/spec/mailers/previews"

  # Expands the lines which load the assets
  config.assets.debug = false
  config.assets.quiet = true

  # S3 file storage
  config.paperclip_defaults = {} # store on local machine for dev
end
