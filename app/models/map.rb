class Map < ActiveRecord::Base

belongs_to :user

has_many :itemmappings, :class_name => 'Mapping', :conditions => {:category => 'Item'}
has_many :synapsemappings, :class_name => 'Mapping', :conditions => {:category => 'Synapse'}

has_many :items, :through => :itemmappings
has_many :synapses, :through => :synapsemappings

def mappings 
	itemmappings + synapsemappings
end
  
  
  ###### JSON ######
  #build a json object of a map
  def self_as_json(current)
    Jbuilder.encode do |json|
	  @items = self.items
	  @synapses = self.synapses
	  
	  json.array!(@items.delete_if{|item| not item.authorize_to_view(current)}) do |item|
		
		#json.adjacencies item.synapses2.delete_if{|synapse| (not @items.include?(synapse.item1)) || (not @synapses.include?(synapse)) || (not synapse.authorize_to_view(current)) || (not synapse.item1.authorize_to_view(current)) } do |json, synapse|
		
	      json.adjacencies item.synapses2.delete_if{|synapse| (not @items.include?(synapse.item1)) || (not synapse.authorize_to_view(current)) || (not synapse.item1.authorize_to_view(current)) } do |json, synapse|
				json.nodeTo synapse.node1_id
				json.nodeFrom synapse.node2_id
				
				@synapsedata = Hash.new
				@synapsedata['$desc'] = synapse.desc
				@synapsedata['$showDesc'] = false
				@synapsedata['$category'] = synapse.category
				@synapsedata['$userid'] = synapse.user.id
				@synapsedata['$username'] = synapse.user.name
				json.data @synapsedata
		  end
		  
		  @itemdata = Hash.new
		  @itemdata['$desc'] = item.desc
		  @itemdata['$link'] = item.link
		  @itemdata['$itemcatname'] = item.item_category.name
		  @itemdata['$userid'] = item.user.id
		  @itemdata['$username'] = item.user.name
		  json.data @itemdata
		  json.id item.id
		  json.name item.name
	  end	
    end
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
  
  # returns Boolean based on whether user has permissions to edit or not
  def authorize_linkto_edit(user)
    if (self.user == user)
		return true
    elsif (self.permission == "commons")
		return true
	end
	return false
  end

end
