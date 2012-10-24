class Synapse < ActiveRecord::Base

belongs_to :user

belongs_to :item1, :class_name => "Item", :foreign_key => "node1_id"
belongs_to :item2, :class_name => "Item", :foreign_key => "node2_id"

  def self_as_json
	Jbuilder.encode do |json|			
		@synapsedata = Hash.new
		@synapsedata['$desc'] = self.desc
		@synapsedata['$category'] = self.category
		json.data @synapsedata
    end
  end
  
  def selfplusnodes_as_json
    Jbuilder.encode do |json|
	  @items = Array.new
	  @items.push(self.item1)
	  @items.push(self.item2)
	  
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
		  json.data @itemdata
		  json.id item.id
		  json.name item.name
	  end	
    end
  end

end
