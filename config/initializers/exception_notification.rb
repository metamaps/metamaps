require 'exception_notification/rails'

ExceptionNotification.configure do |config|
  # Ignore additional exception types.
  # ActiveRecord::RecordNotFound, AbstractController::ActionNotFound and
  # ActionController::RoutingError are already added.
  config.ignored_exceptions += %w(
    ActionView::TemplateError CustomError UnauthorizedException
    InvalidArgumentException InvalidEntityException InvalidRequestException
    NotFoundException ValidationException
  )

  # Adds a condition to decide when an exception must be ignored or not.
  # The ignore_if method can be invoked multiple times to add extra conditions.
  config.ignore_if do |_exception, _options|
    !Rails.env.production?
  end

  # Notifiers ######

  if ENV['SLACK_EN_WEBHOOK_URL']
    config.add_notifier :slack, webhook_url: ENV['SLACK_EN_WEBHOOK_URL']
  end

  # Email notifier sends notifications by email.
  # config.add_notifier :email, {
  #   :email_prefix         => "[ERROR] ",
  #   :sender_address       => %{"Notifier" <notifier@example.com>},
  #   :exception_recipients => %w{exceptions@example.com}
  # }

  # Webhook notifier sends notifications over HTTP protocol. Requires 'httparty' gem.
  # config.add_notifier :webhook, {
  #   :url => 'http://example.com:5555/hubot/path',
  #   :http_method => :post
  # }
end
