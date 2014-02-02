module TopicsHelper

  ## this one is for building our custom JSON autocomplete format for typeahead
  def autocomplete_array_json(topics)
    temp = []
    topics.each do |t|
      topic = {}
      topic['id'] = t.id
      topic['label'] = t.name
      topic['value'] = t.name
      topic['description'] = t.desc.truncate(35) # make this return matched results
      topic['type'] = t.metacode.name
      topic['typeImageURL'] = '/assets/' + t.metacode.icon
      topic['permission'] = t.permission
      topic['mapCount'] = t.maps.count
      topic['synapseCount'] = t.synapses.count
      topic['originator'] = t.user.name
      topic['rtype'] = "topic"
      
      temp.push topic
    end
    return temp
  end

#find all nodes in any given nodes network
  def network(node, array, count)
	# recurse starting with a node to find all connected nodes and return an array of topics that constitutes the starting nodes network

	# if the array of nodes is empty initialize it
	if array.nil?
		array = Array.new
	end

	# add the node to the array
	array.push(node)

	if count == 0
		return array
	end

	count = count - 1

	# check if each relative is already in the array and if not, call the network function again
	if not node.relatives.empty?
		if (node.relatives-array).empty?
			return array
		else
			(node.relatives-array).each do |relative|	
				array = (array | network(relative, array, count))				
			end
			return array
		end

	elsif node.relatives.empty?
		return array
	end	  
  end
  
  #return a json object containing all of a users added synapses
  def synapses_as_json(current, synapses)
    Jbuilder.encode do |json|
	  @topics = Array.new

	  synapses.each do |synapse|
		@topics.push(synapse.topic1) if (not @topics.include?(synapse.topic1)) && synapse.topic1.authorize_to_view(current)
		@topics.push(synapse.topic2) if (not @topics.include?(synapse.topic2)) && synapse.topic2.authorize_to_view(current)
	  end

	  json.array!(@topics) do |topic|
	      json.adjacencies topic.synapses2.delete_if{|synapse| not @topics.include?(Topic.find_by_id(synapse.node1_id))} do |json, synapse|
				json.nodeTo synapse.node1_id
				json.nodeFrom synapse.node2_id

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
  
  def all_as_json(current, user)
  
    # current is current user
    
    Jbuilder.encode do |json|
    if user.nil?
      @topics = Topic.visibleToUser(current, nil) 
	    @synapses = Synapse.visibleToUser(current, nil)
    else
      @topics = Topic.visibleToUser(current, user) 
	    @synapses = Synapse.visibleToUser(current, user)
    end

	  json.array!(@topics) do |topic|
	      json.adjacencies topic.synapses2.delete_if{|synapse| (not @topics.include?(Topic.find_by_id(synapse.node1_id))) || (not @synapses.include?(synapse))} do |json, synapse|
				json.nodeTo synapse.node1_id
				json.nodeFrom synapse.node2_id

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

end
