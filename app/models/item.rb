class Item < ActiveRecord::Base

belongs_to :user

has_many :itemitem_c, :foreign_key => 'parent_item_id', :class_name => 'Itemitem'
has_many :itemitem_p, :foreign_key => 'item_id', :class_name => 'Itemitem'

has_many :groupitems
has_many :personitems

has_many :groups, :through => :groupitems
has_many :people, :through => :personitems

belongs_to :item_category

has_many :child_items, :through => :itemitem_c, :source => :item
has_many :parent_items, :through => :itemitem_p, :source => :parent_item

end
