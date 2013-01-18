class Topic < ActiveRecord::Base

include TopicsHelper

belongs_to :user

has_many :synapses1, :class_name => 'Synapse', :foreign_key => 'node1_id'
has_many :synapses2, :class_name => 'Synapse', :foreign_key => 'node2_id'
has_many :topics1, :through => :synapses2, :source => :topic1
has_many :topics2, :through => :synapses1, :source => :topic2

has_many :mappings
has_many :maps, :through => :mappings
  
  def synapses
     synapses1 + synapses2
  end
  
  def relatives
     topics1 + topics2
  end 

belongs_to :metacode

  def topic_autocomplete_method
    "Get: #{self.name}"
  end
  
  def mk_permission
    if self.permission == "commons"
      "cc"
    elsif self.permission == "public"
      "pu"
    elsif self.permission == "private"
      "pr"
    end
  end

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
		  @inmaps = Array.new
      self.maps.each do |map|
        @inmaps.push(map.id)
      end
      
		  @topicdata = Hash.new
		  @topicdata['$desc'] = self.desc
		  @topicdata['$link'] = self.link
		  @topicdata['$metacode'] = self.metacode.name
      @topicdata['$inmaps'] = @inmaps
		  @topicdata['$userid'] = self.user.id
		  @topicdata['$username'] = self.user.name
		  json.data @topicdata
		  json.id self.id
		  json.name self.name
    end
  end
  
  def selfonmap_as_json(mapid)
    Jbuilder.encode do |json|
		  @inmaps = Array.new
      self.maps.each do |map|
        @inmaps.push(map.id)
      end
      
		  @topicdata = Hash.new
		  @topicdata['$desc'] = self.desc
		  @topicdata['$link'] = self.link
		  @topicdata['$metacode'] = self.metacode.name
      @topicdata['$inmaps'] = @inmaps
		  @topicdata['$userid'] = self.user.id
		  @topicdata['$username'] = self.user.name
      @mapping = Mapping.find_by_topic_id_and_map_id(self.id,mapid)
		  @topicdata['$xloc'] = @mapping.xloc
		  @topicdata['$yloc'] = @mapping.yloc
		  @topicdata['$mappingid'] = @mapping.id
		  json.data @topicdata
		  json.id self.id
		  json.name self.name
    end
  end
  
  #build a json object of everything connected to a specified node
  def network_as_json(current)
    Jbuilder.encode do |json|
	  @topics = network(self,nil,4)
	  
	    if @topics.count > 1
		  json.array!(@topics.delete_if{|topic| (not topic.authorize_to_view(current)) || (not topic.has_viewable_synapses(current))}) do |topic|
			
			  json.adjacencies topic.synapses1.delete_if{|synapse| (not @topics.include?(synapse.topic2)) || (not synapse.authorize_to_view(current)) || (not synapse.topic2.authorize_to_view(current)) } do |json, synapse|
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
        topic.maps.each do |map|
          @inmaps.push(map.id)
        end
        
        @topicdata = Hash.new
        @topicdata['$desc'] = topic.desc
        @topicdata['$link'] = topic.link
        @topicdata['$metacode'] = topic.metacode.name
        @topicdata['$inmaps'] = @inmaps
			  @topicdata['$userid'] = topic.user.id
			  @topicdata['$username'] = topic.user.name
			  json.data @topicdata
			  json.id topic.id
			  json.name topic.name
		  end
		elsif @topics.count == 1
		    json.array!(@topics) do |topic|
          @inmaps = Array.new
          topic.maps.each do |map|
            @inmaps.push(map.id)
          end
          
          @topicdata = Hash.new
          @topicdata['$desc'] = topic.desc
          @topicdata['$link'] = topic.link
          @topicdata['$metacode'] = topic.metacode.name
          @topicdata['$inmaps'] = @inmaps
          @topicdata['$userid'] = topic.user.id
          @topicdata['$username'] = topic.user.name
          json.data @topicdata
          json.id topic.id
          json.name topic.name
		    end
		end
    end
  end
  
  ##### PERMISSIONS ######
  
  scope :visibleToUser, lambda { |current, user|  
    if user != nil
	   if user != current
		 Topic.find_all_by_user_id_and_permission(user.id, "commons") | Topic.find_all_by_user_id_and_permission(user.id, "public")
	   elsif user ==  current
	     Topic.find_all_by_user_id_and_permission(user.id, "commons") | Topic.find_all_by_user_id_and_permission(user.id, "public") | current.topics.where(:permission => "private")
	   end
	elsif (current != nil &&  user == nil)
		Topic.find_all_by_permission("commons") | Topic.find_all_by_permission("public") | current.topics.where(:permission => "private")
	elsif (current == nil) 
		Topic.find_all_by_permission("commons") | Topic.find_all_by_permission("public")
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
