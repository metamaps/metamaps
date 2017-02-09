# frozen_string_literal: true
class UserMap < ApplicationRecord
  belongs_to :map
  belongs_to :user
  belongs_to :access_request
  
  after_create :after_created_async

  def mark_invite_notifications_as_read
    Mailboxer::Notification.where(notified_object: self).find_each do |notification|
      Mailboxer::Receipt.where(notification: notification).update_all(is_read: true)
    end
  end
  
  protected
  
  def after_created_async
    if access_request
      NotificationService.access_approved(self.access_request)
    else
      NotificationService.invite_to_edit(self)
    end
  end
  handle_asynchronously :after_created_async
end
