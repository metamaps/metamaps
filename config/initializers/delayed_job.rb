module ExceptionNotifierInDelayedJob
  def handle_failed_job(job, error)
    ExceptionNotfier.notify_exception(error)
  end
end

Delayed::Worker.class_eval do
  prepend ExceptionNotifierInDelayedJob
end
