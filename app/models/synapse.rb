class Synapse < ActiveRecord::Base

  belongs_to :user

  belongs_to :topic1, :class_name => "Topic", :foreign_key => "node1_id"
  belongs_to :topic2, :class_name => "Topic", :foreign_key => "node2_id"

  has_many :mappings
  has_many :maps, :through => :mappings

  def user_name
    self.user.name
  end

  def user_image
    self.user.image.url
  end

  def as_json(options={})
    super(:methods =>[:user_name, :user_image])
  end
  
  # sends push updates through redis to websockets for realtime updates
  def message action, origin_user_id
  
    return if self.permission == "private" and action == "create"
    
    #get array of all maps topic appears in
    @maps = self.maps
    #sends update to all maps that topic appears in who have realtime on
    @maps.each do |map|
      msg = { origin: origin_user_id,
          mapid: map.id,
          resource: 'Synapse',
          action: action,
          id: self.id,
          obj: self.self_as_json.html_safe }
      $redis.publish 'maps', msg.to_json
    end 
  end
  
  ##### PERMISSIONS ######
  
  # returns false if user not allowed to 'show' Topic, Synapse, or Map
  def authorize_to_show(user)  
	if (self.permission == "private" && self.user != user)
		return false
	end
	return self
  end
  
  # returns false if user not allowed to 'edit' Topic, Synapse, or Map
  def authorize_to_edit(user)  
	if (self.permission == "private" && self.user != user)
		return false
	elsif (self.permission == "public" && self.user != user)
		return false
	end
	return self
  end
  
  # returns Boolean if user allowed to view Topic, Synapse, or Map
  def authorize_to_view(user)  
	if (self.permission == "private" && self.user != user)
		return false
	end
	return true
  end

end
