class Map < ActiveRecord::Base

belongs_to :user

has_many :topicmappings, :class_name => 'Mapping', :conditions => {:category => 'Topic'}
has_many :synapsemappings, :class_name => 'Mapping', :conditions => {:category => 'Synapse'}

has_many :topics, :through => :topicmappings
has_many :synapses, :through => :synapsemappings

def mappings 
	topicmappings + synapsemappings
end

def mk_permission
  if self.permission == "commons"
    "co"
  elsif self.permission == "public"
    "pu"
  elsif self.permission == "private"
    "pr"
  end
end

  #return an array of the contributors to the map
  def contributors
    contributors = []
    
    self.mappings.each do |m|
      contributors.push(m.user) if !contributors.include?(m.user)
    end
    
    return contributors
  end
  
  ##### PERMISSIONS ######
  
  scope :visibleToUser, lambda { |current, user|  
    if user != nil
	   if user != current
		 Map.find_all_by_user_id_and_permission(user.id, "commons") | Map.find_all_by_user_id_and_permission(user.id, "public")
	   elsif user ==  current
	     Map.find_all_by_user_id_and_permission(user.id, "commons") | Map.find_all_by_user_id_and_permission(user.id, "public") | current.maps.where(:permission => "private")
	   end
	elsif (current != nil && user == nil) 
		Map.find_all_by_permission("commons") | Map.find_all_by_permission("public") | current.maps.where(:permission => "private")
	elsif (current == nil) 
		Map.find_all_by_permission("commons") | Map.find_all_by_permission("public")
	end
  }
  
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
