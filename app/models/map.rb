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
  
  
  ###### JSON ######
  #build a json object of a map
  def self_as_json(current)
    Jbuilder.encode do |json|
	  @topics = self.topics
	  @synapses = self.synapses
	  
	  json.array!(@topics.delete_if{|topic| not topic.authorize_to_view(current)}) do |topic|
		
		#json.adjacencies topic.synapses2.delete_if{|synapse| (not @topics.include?(synapse.topic1)) || (not @synapses.include?(synapse)) || (not synapse.authorize_to_view(current)) || (not synapse.topic1.authorize_to_view(current)) } do |json, synapse|
		
	      json.adjacencies topic.synapses1.delete_if{|synapse| (not @synapses.include?(synapse)) || (not @topics.include?(synapse.topic2)) || (not synapse.authorize_to_view(current)) || (not synapse.topic2.authorize_to_view(current)) } do |json, synapse|
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
      @mapsString = ""
      topic.maps.each_with_index do |map, index|
        @inmaps.push(map.id)
        @mapsString += map.name
        @mapsString += (index+1) == topic.maps.count ? "" : ", "
      end
      
		  @topicdata = Hash.new
		  @topicdata['$desc'] = topic.desc
		  @topicdata['$link'] = topic.link
		  @topicdata['$metacode'] = topic.metacode.name
      @topicdata['$inmaps'] = @inmaps
      @topicdata['$inmapsString'] = @mapsString
      @topicdata['$synapseCount'] = topic.synapses.count
		  @topicdata['$userid'] = topic.user.id
		  @topicdata['$username'] = topic.user.name
		  @mapping = Mapping.find_by_topic_id_and_map_id(topic.id,self.id)
		  @topicdata['$xloc'] = @mapping.xloc
		  @topicdata['$yloc'] = @mapping.yloc
		  @topicdata['$mappingid'] = @mapping.id
      @topicdata['$permission'] = topic.permission
      @topicdata['$date'] = topic.created_at.strftime("%m/%d/%Y")
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
