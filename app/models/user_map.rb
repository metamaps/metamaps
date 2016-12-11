# frozen_string_literal: true
class UserMap < ApplicationRecord
  belongs_to :map
  belongs_to :user

  def mark_invite_notifications_as_read
    Mailboxer::Notification.where(notified_object: self).find_each do |notification|
      Mailboxer::Receipt.where(notification: notification).update_all(is_read: true)
    end
  end
end
