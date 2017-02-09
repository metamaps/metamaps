# frozen_string_literal: true
class ApplicationMailer < ActionMailer::Base
  default from: 'team@metamaps.cc'
  layout 'mailer'

  def deliver
    raise NotImplementedError('Please use Mailboxer to send your emails.')
  end

  class << self
    def mail_for_notification(notification)
      case notification.notification_code
        when MAILBOXER_CODE_ACCESS_REQUEST
          request = notification.notified_object
          MapMailer.access_request(request)
        when MAILBOXER_CODE_ACCESS_APPROVED
          request = notification.notified_object
          MapMailer.access_approved(request)
        when MAILBOXER_CODE_INVITE_TO_EDIT
          user_map = notification.notified_object
          MapMailer.invite_to_edit(user_map)
      end
    end
  end
end
