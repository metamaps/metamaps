class Itemitem < ActiveRecord::Base

belongs_to :item
    
belongs_to :parent_item, :class_name => "Item", :foreign_key => "parent_item_id"

end
