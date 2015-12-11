class Message < ActiveRecord::Base

  belongs_to :user
  belongs_to :resource, polymorphic: true

  def user_name
    self.user.name
  end

  def user_image
    self.user.image.url
  end

  def as_json(options={})
    json = super(:methods =>[:user_name, :user_image])
    json
  end

  ##### PERMISSIONS ######
  
  def authorize_to_delete(user)
    if (self.user != user)
      return false
    end
    return self
  end

  # returns false if user not allowed to 'show' Topic, Synapse, or Map
  def authorize_to_show(user)
    if (self.resource && self.resource.permission == "private" && self.resource.user != user)
  		return false
  	end
  	return self
  end
  
  # returns false if user not allowed to 'edit' Topic, Synapse, or Map
  def authorize_to_edit(user)  
  	if !user
      return false
    elsif (self.user != user)
  		return false
  	end
  	return self
  end
  
  # returns Boolean if user allowed to view Topic, Synapse, or Map
  def authorize_to_view(user)  
  	if (self.resource && self.resource.permission == "private" && self.resource.user != user)
  		return false
  	end
  	return true
  end

end
