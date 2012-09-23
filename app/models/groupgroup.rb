class Groupgroup < ActiveRecord::Base

belongs_to :group
  
belongs_to :parent_group, :class_name => "Group", :foreign_key => "parent_group_id"

end
