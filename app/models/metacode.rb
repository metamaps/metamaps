class Metacode < ActiveRecord::Base

has_many :topics

  def hasSelected(user)
    return true if user.settings.metacodes.include? self.id.to_s
    return false
  end

end
