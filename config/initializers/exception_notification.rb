# frozen_string_literal: true
require 'exception_notification/rails'

module ExceptionNotifier
  class MetamapsNotifier < SlackNotifier
    def call(exception, options = {})
      # trick original notifier to "ping" self, storing the result
      # in @message_opts and then modifying the result
      @old_notifier = @notifier
      @notifier = self
      super
      @notifier = @old_notifier

      @message_opts[:attachments][0][:fields] = new_fields(exception, options[:env])
      @message_opts[:attachments][0][:text] = new_text(exception, options[:env])

      @notifier.ping '', @message_opts
    end

    def ping(message, message_opts)
      @message = message
      @message_opts = message_opts
    end

    private

    def new_fields(exception, env)
      new_fields = []

      backtrace = exception.backtrace.reject { |line| line =~ %r{/(vendor/bundle|vendor_ruby)/} }
      backtrace = backtrace[0..3] if backtrace.length > 4
      backtrace = "```\n#{backtrace.join("\n")}\n```"
      new_fields << { title: 'Backtrace', value: backtrace }

      user = env.dig('exception_notifier.exception_data', :current_user)
      new_fields << { title: 'Current User', value: "`#{user.name} <#{user.email}>`" }

      new_fields
    end

    def new_text(exception, _env)
      text = @message_opts[:attachments][0][:text].chomp
      text += ': ' + exception.message + "\n"
      text
    end
  end
end

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
    config.add_notifier :metamaps, webhook_url: ENV['SLACK_EN_WEBHOOK_URL']
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
