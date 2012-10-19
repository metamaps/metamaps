class Item < ActiveRecord::Base
include ItemsHelper

belongs_to :user

has_many :synapses1, :class_name => 'Synapse', :foreign_key => 'node1_id' #, :conditions => {:category => 'Item'}
has_many :synapses2, :class_name => 'Synapse', :foreign_key => 'node2_id' #, :conditions => {:category => 'Item'}
has_many :items1, :through => :synapses2, :source => :item1
has_many :items2, :through => :synapses1, :source => :item2
  
  def synapses
     synapses1 + synapses2
  end
  
  def relatives
     items1 + items2
  end 

belongs_to :item_category

  def self_as_json
    Jbuilder.encode do |json|
	  @single = Array.new
	  @single.push(self)
	  
	  json.array!(@single) do |item|
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
  
  #build a json object of everything connected to a specified node
  def map_as_json
    Jbuilder.encode do |json|
	  @single = Array.new
	  @single.push(self)
	  @items = network(self,nil)
	  
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
  
  def all_as_json
    Jbuilder.encode do |json|

	  @items = Item.all
	  
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
