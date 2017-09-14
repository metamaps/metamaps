Delayed::Worker.class_eval do

    def handle_failed_job_with_notification(job, error)
      handle_failed_job_without_notification(job, error)
      ExceptionNotifier.notify_exception(error)
    end
    alias_method_chain :handle_failed_job, :notification

end
