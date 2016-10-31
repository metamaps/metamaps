# frozen_string_literal: true
Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb

  config.log_level = :warn
  config.eager_load = true

  # 12 factor: log to stdout
  logger = ActiveSupport::Logger.new(STDOUT)
  logger.formatter = config.log_formatter
  config.logger = ActiveSupport::TaggedLogging.new(logger)

  # Code is not reloaded between requests
  config.cache_classes = true

  # Full error reports are disabled and caching is turned on
  config.consider_all_requests_local       = false
  config.action_controller.perform_caching = true

  # Disable Rails's static asset server (Apache or nginx will already do this)
  config.public_file_server.enabled = ENV['RAILS_SERVE_STATIC_FILES'].present?

  # Don't fallback to assets pipeline if a precompiled asset is missed
  config.assets.compile = false

  config.assets.js_compressor = :uglifier

  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = {
    address:       ENV['SMTP_SERVER'],
    port:          ENV['SMTP_PORT'],
    user_name:     ENV['SMTP_USERNAME'],
    password:      ENV['SMTP_PASSWORD'],
    authentication:       'plain',
    enable_starttls_auto: true,
    openssl_verify_mode: 'none'
  }
  config.action_mailer.default_url_options = { host: ENV['MAILER_DEFAULT_URL'] }
  # Don't care if the mailer can't send
  config.action_mailer.raise_delivery_errors = true

  # Generate digests for assets URLs
  config.assets.digest = true

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation can not be found)
  config.i18n.fallbacks = true

  # Send deprecation notices to registered listeners
  config.active_support.deprecation = :notify
end
