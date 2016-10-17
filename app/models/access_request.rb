class AccessRequest < ApplicationRecord
  belongs_to :user
  belongs_to :map

  def approve
    self.approved = true
    self.answered = true
    self.save
    UserMap.create(user: self.user, map: self.map)
    MapMailer.invite_to_edit_email(self.map, self.map.user, self.user).deliver_later
  end

  def deny
    self.approved = false
    self.answered = true
    self.save
  end
end
