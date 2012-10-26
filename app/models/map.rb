class Map < ActiveRecord::Base

belongs_to :user

has_many :itemmappings, :class_name => 'Mapping', :conditions => {:category => 'Item'}
has_many :synapsemappings, :class_name => 'Mapping', :conditions => {:category => 'Synapse'}

has_many :items, :through => :itemmappings
has_many :synapses, :through => :synapsemappings

def mappings 
	itemmappings + synapsemappings
end 

  #build a json object of a map
  def self_as_json
    Jbuilder.encode do |json|
	  @items = self.items
	  @synapses = self.synapses
	  
	  json.array!(@items) do |item|
	      json.adjacencies item.synapses2.delete_if{|synapse| not @synapses.include?(synapse)} do |json, synapse|
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
