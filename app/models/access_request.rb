# frozen_string_literal: true
class AccessRequest < ApplicationRecord
  belongs_to :user
  belongs_to :map
  has_one    :user_map
  
  after_create :after_created_async

  def approve
    self.approved = true
    self.answered = true
    save

    Mailboxer::Notification.where(notified_object: self).find_each do |notification|
      Mailboxer::Receipt.where(notification: notification).update_all(is_read: true)
    end

    UserMap.create(user: user, map: map, access_request: self)
  end

  def deny
    self.approved = false
    self.answered = true
    save

    Mailboxer::Notification.where(notified_object: self).find_each do |notification|
      Mailboxer::Receipt.where(notification: notification).update_all(is_read: true)
    end
  end

  def requested_text
    map.name + ' - request to edit'
  end

  def approved_text
    map.name + ' - access approved'
  end
  
  protected
  
  def after_created_async
    NotificationService.access_request(self)
  end
  handle_asynchronously :after_created_async
end
