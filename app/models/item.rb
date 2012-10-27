class Item < ActiveRecord::Base
include ItemsHelper

belongs_to :user

has_many :synapses1, :class_name => 'Synapse', :foreign_key => 'node1_id'
has_many :synapses2, :class_name => 'Synapse', :foreign_key => 'node2_id'
has_many :items1, :through => :synapses2, :source => :item1
has_many :items2, :through => :synapses1, :source => :item2

has_many :mappings
has_many :maps, :through => :mappings
  
  def synapses
     synapses1 + synapses2
  end
  
  def relatives
     items1 + items2
  end 

belongs_to :item_category

  # has no viewable synapses helper function
  def has_viewable_synapses(current)
	result = false
	self.synapses.each do |synapse|
		if synapse.authorize_to_view(current)
			result = true
		end
	end
	return result
  end
  
  ###### JSON ######
  def self_as_json
    Jbuilder.encode do |json|
		  
		  @itemdata = Hash.new
		  @itemdata['$desc'] = self.desc
		  @itemdata['$link'] = self.link
		  @itemdata['$itemcatname'] = self.item_category.name
		  @itemdata['$userid'] = self.user.id
		  @itemdata['$username'] = self.user.name
		  json.data @itemdata
		  json.id self.id
		  json.name self.name
    end
  end
  
  #build a json object of everything connected to a specified node
  def network_as_json(current)
    Jbuilder.encode do |json|
	  @items = network(self,nil)
	  
	    if @items.count > 1
		  json.array!(@items.delete_if{|item| (not item.authorize_to_view(current)) || (not item.has_viewable_synapses(current))}) do |item|
			
			  json.adjacencies item.synapses2.delete_if{|synapse| (not @items.include?(synapse.item1)) || (not synapse.authorize_to_view(current)) || (not synapse.item1.authorize_to_view(current)) } do |json, synapse|
					json.nodeTo synapse.node1_id
					json.nodeFrom synapse.node2_id
					
					@synapsedata = Hash.new
					@synapsedata['$desc'] = synapse.desc
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
		elsif @items.count == 1
		    json.array!(@items) do |item|
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
  end
  
  ##### PERMISSIONS ######
  
  scope :visibleToUser, lambda { |current, user|  
    if user != nil
	   if user != current
		 Item.find_all_by_user_id_and_permission(user.id, "commons") | Item.find_all_by_user_id_and_permission(user.id, "public")
	   elsif user ==  current
	     Item.find_all_by_user_id_and_permission(user.id, "commons") | Item.find_all_by_user_id_and_permission(user.id, "public") | current.items.where(:permission => "private")
	   end
	elsif (current != nil &&  user == nil)
		Item.find_all_by_permission("commons") | Item.find_all_by_permission("public") | current.items.where(:permission => "private")
	elsif (current == nil) 
		Item.find_all_by_permission("commons") | Item.find_all_by_permission("public")
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
