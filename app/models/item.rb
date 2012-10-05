class Item < ActiveRecord::Base

belongs_to :user

has_many :itemitem_c, :foreign_key => 'parent_item_id', :class_name => 'Itemitem'
has_many :itemitem_p, :foreign_key => 'item_id', :class_name => 'Itemitem'

has_many :groupitems
has_many :personitems

has_many :groups, :through => :groupitems
has_many :people, :through => :personitems

has_many :synapses1, :class_name => 'Synapse', :foreign_key => 'node1_id', :conditions => {:category => 'Item'}
has_many :synapses2, :class_name => 'Synapse', :foreign_key => 'node2_id', :conditions => {:category => 'Item'}
has_many :items1, :through => :synapses2, :source => :item1
has_many :items2, :through => :synapses1, :source => :item2
  
  def siblings
     items1 + items2
  end 

belongs_to :item_category

has_many :child_items, :through => :itemitem_c, :source => :item
has_many :parent_items, :through => :itemitem_p, :source => :parent_item

end
