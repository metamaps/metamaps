module ItemsHelper
  
  #find all nodes in any given nodes network
  def network(node, array, count)
	# recurse starting with a node to find all connected nodes and return an array of items that constitutes the starting nodes network
	
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
	  @items = Array.new
	  
	  synapses.each do |synapse|
		@items.push(synapse.item1) if (not @items.include?(synapse.item1)) && synapse.item1.authorize_to_view(current)
		@items.push(synapse.item2) if (not @items.include?(synapse.item2)) && synapse.item2.authorize_to_view(current)
	  end
	  
	  json.array!(@items) do |item|
	      json.adjacencies item.synapses2.delete_if{|synapse| not @items.include?(Item.find_by_id(synapse.node1_id))} do |json, synapse|
				json.nodeTo synapse.node1_id
				json.nodeFrom synapse.node2_id
				
				@synapsedata = Hash.new
				@synapsedata['$desc'] = synapse.desc
				@synapsedata['$category'] = synapse.category
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
  
  def all_as_json(current)
    Jbuilder.encode do |json|

	  @items = Item.visibleToUser(current, nil)
	  @synapses = Synapse.visibleToUser(current, nil)
	  
	  json.array!(@items) do |item|
	      json.adjacencies item.synapses2.delete_if{|synapse| (not @items.include?(Item.find_by_id(synapse.node1_id))) || (not @synapses.include?(synapse))} do |json, synapse|
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
    end
  end


end
