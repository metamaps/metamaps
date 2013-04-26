class Synapse < ActiveRecord::Base

belongs_to :user

belongs_to :topic1, :class_name => "Topic", :foreign_key => "node1_id"
belongs_to :topic2, :class_name => "Topic", :foreign_key => "node2_id"

has_many :mappings
has_many :maps, :through => :mappings

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

  ##### JSON ######

  def self_as_json
	Jbuilder.encode do |json|			
		@synapsedata = Hash.new
		@synapsedata['$desc'] = self.desc
		@synapsedata['$showDesc'] = false
		@synapsedata['$category'] = self.category
		@synapsedata['$id'] = self.id
		@synapsedata['$userid'] = self.user.id
		@synapsedata['$username'] = self.user.name
		@synapsedata['$direction'] = [self.node1_id.to_s(), self.node2_id.to_s()]
    @synapsedata['$permission'] = self.permission
		json.data @synapsedata
    end
  end
  
  def selfplusnodes_as_json
    Jbuilder.encode do |json|
	  @topics = Array.new
	  @topics.push(self.topic1)
	  @topics.push(self.topic2)
	  
	  json.array!(@topics) do |topic|
	      json.adjacencies topic.synapses1.delete_if{|synapse| not @topics.include?(Topic.find_by_id(synapse.node2_id))} do |json, synapse|
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
        @synapsedata['$permission'] = synapse.permission
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
      @topicdata['$permission'] = topic.permission
		  json.data @topicdata
		  json.id topic.id
		  json.name topic.name
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
