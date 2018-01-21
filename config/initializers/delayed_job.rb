# frozen_string_literal: true

module ExceptionNotifierInDelayedJob
  def handle_failed_job(job, error)
    super
    ExceptionNotfier.notify_exception(error)
  end
end

Delayed::Worker.class_eval do
  prepend ExceptionNotifierInDelayedJob
end

Delayed::Worker.logger = Logger.new(Rails.root.join('log', 'delayed_job.log'))
