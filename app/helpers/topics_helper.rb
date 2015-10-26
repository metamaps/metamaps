module TopicsHelper

  ## this one is for building our custom JSON autocomplete format for typeahead
  def autocomplete_array_json(topics)
    temp = []
    topics.each do |t|
      topic = {}
      topic['id'] = t.id
      topic['label'] = t.name
      topic['value'] = t.name
      topic['description'] = t.desc.truncate(70) # make this return matched results
      topic['type'] = t.metacode.name
      topic['typeImageURL'] = t.metacode.asset_path_icon
      topic['permission'] = t.permission
      topic['mapCount'] = t.maps.count
      topic['synapseCount'] = t.synapses.count
      topic['originator'] = t.user.name
      topic['originatorImage'] = t.user.image.url(:thirtytwo)
      topic['rtype'] = "topic"
      topic['inmaps'] = t.inmaps
      topic['inmapsLinks'] = t.inmapsLinks
       
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
end
