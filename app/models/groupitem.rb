class Groupitem < ActiveRecord::Base

belongs_to :group, :class_name => "Group", :foreign_key => "group_id"
  
belongs_to :item, :class_name => "Item", :foreign_key => "item_id"

end
