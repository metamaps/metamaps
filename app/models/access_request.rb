class AccessRequest < ApplicationRecord
  belongs_to :user
  belongs_to :map

  def approve
    self.approved = true
    self.answered = true
    self.save

    Mailboxer::Notification.where(notified_object: self).each do |notification|
      Mailboxer::Receipt.where(notification: notification).update_all(is_read: true)
    end
    
    UserMap.create(user: user, map: map)
    mail = MapMailer.invite_to_edit_email(map, map.user, user)
    user.notify(mail.subject, 'invite to edit', self, true, MAILBOXER_CODE_INVITED_TO_EDIT)
  end

  def deny
    self.approved = false
    self.answered = true
    self.save

    Mailboxer::Notification.where(notified_object: self).each do |notification|
      Mailboxer::Receipt.where(notification: notification).update_all(is_read: true)
    end
  end
end
