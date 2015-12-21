Metamaps::Application.configure do
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
  
  # S3 file storage
  config.paperclip_defaults = {
    storage: :s3,
    s3_credentials: {
      bucket: ENV['S3_BUCKET_NAME'],
      access_key_id: ENV['AWS_ACCESS_KEY_ID'],
      secret_access_key: ENV['AWS_SECRET_ACCESS_KEY']
    },
    s3_protocol: 'https'
  }
    
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = {
    address:       ENV['SMTP_SERVER'],
    port:          ENV['SMTP_PORT'],
    user_name:     ENV['SMTP_USERNAME'],
    password:      ENV['SMTP_PASSWORD'],
    #domain:        ENV['SMTP_DOMAIN']
    authentication:       'plain',
    enable_starttls_auto: true,
    openssl_verify_mode: 'none'    }
  config.action_mailer.default_url_options = { :host => 'localhost:3000' }
  # Don't care if the mailer can't send
  config.action_mailer.raise_delivery_errors = true

  # Print deprecation notices to the Rails logger
  config.active_support.deprecation = :log

  # Expands the lines which load the assets
  config.assets.debug = true
end
