# frozen_string_literal: true
class ApplicationMailer < ActionMailer::Base
  default from: 'team@metamaps.cc'
  layout 'mailer'

  def deliver
    raise NotImplementedError('Please use Mailboxer to send your emails.')
  end

  class << self
    def mail_for_notification(notification)
      if notification.notification_code == MAILBOXER_CODE_ACCESS_REQUEST
        request = notification.notified_object
        MapMailer.access_request_email(request)
      elsif notification.notification_code == MAILBOXER_CODE_ACCESS_APPROVED
        request = notification.notified_object
        MapMailer.access_approved_email(request)
      elsif notification.notification_code == MAILBOXER_CODE_INVITE_TO_EDIT
        user_map = notification.notified_object
        MapMailer.invite_to_edit_email(user_map.map, user_map.map.user, user_map.user)
      end
    end
  end
end
