class Synapse < ActiveRecord::Base

belongs_to :user

belongs_to :item1, :class_name => "Item", :foreign_key => "node1_id"
belongs_to :item2, :class_name => "Item", :foreign_key => "node2_id"

has_many :mappings
has_many :maps, :through => :mappings

  ##### JSON ######

  def self_as_json
	Jbuilder.encode do |json|			
		@synapsedata = Hash.new
		@synapsedata['$desc'] = self.desc
		@synapsedata['$showDesc'] = false
		@synapsedata['$category'] = self.category
		@synapsedata['$id'] = synapse.id
		@synapsedata['$userid'] = synapse.user.id
		@synapsedata['$username'] = synapse.user.name
		@synapsedata['$direction'] = [synapse.node1_id.to_s(), synapse.node2_id.to_s()]
		json.data @synapsedata
    end
  end
  
  def selfplusnodes_as_json
    Jbuilder.encode do |json|
	  @items = Array.new
	  @items.push(self.item1)
	  @items.push(self.item2)
	  
	  json.array!(@items) do |item|
	      json.adjacencies item.synapses1.delete_if{|synapse| not @items.include?(Item.find_by_id(synapse.node2_id))} do |json, synapse|
				json.nodeTo synapse.node2_id
				json.nodeFrom synapse.node1_id
				
				@synapsedata = Hash.new
				@synapsedata['$desc'] = synapse.desc
				@synapsedata['$showDesc'] = false
				@synapsedata['$category'] = synapse.category
				@synapsedata['$id'] = synapse.id
				@synapsedata['$userid'] = synapse.user.id
				@synapsedata['$username'] = synapse.user.name
				@synapsedata['$direction'] = [synapse.node1_id.to_s(), synapse.node2_id.to_s()]
				json.data @synapsedata
		  end
		  
		  @inmaps = Array.new
      item.maps.each do |map|
        @inmaps.push(map.id)
      end
      
		  @itemdata = Hash.new
		  @itemdata['$desc'] = item.desc
		  @itemdata['$link'] = item.link
		  @itemdata['$itemcatname'] = item.item_category.name
      @itemdata['$inmaps'] = @inmaps
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
		 Synapse.find_all_by_user_id_and_permission(user.id, "commons") | Synapse.find_all_by_user_id_and_permission(user.id, "public")
	   elsif user ==  current
	     Synapse.find_all_by_user_id_and_permission(user.id, "commons") | Synapse.find_all_by_user_id_and_permission(user.id, "public") | current.synapses.where(:permission => "private")
	   end
	elsif (current != nil &&  user == nil)
		Synapse.find_all_by_permission("commons") | Synapse.find_all_by_permission("public") | current.synapses.where(:permission => "private")
	elsif (current == nil) 
		Synapse.find_all_by_permission("commons") | Synapse.find_all_by_permission("public")
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
