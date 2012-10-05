class Synapse < ActiveRecord::Base

belongs_to :user

belongs_to :item1, :class_name => "Item", :foreign_key => "node1_id"
belongs_to :item2, :class_name => "Item", :foreign_key => "node2_id"

belongs_to :person1, :class_name => "Person", :foreign_key => "node1_id"
belongs_to :person2, :class_name => "Person", :foreign_key => "node2_id"

belongs_to :group1, :class_name => "Group", :foreign_key => "node1_id"
belongs_to :group2, :class_name => "Group", :foreign_key => "node2_id"

end
