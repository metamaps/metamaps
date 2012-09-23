class Groupperson < ActiveRecord::Base

belongs_to :group, :class_name => "Group", :foreign_key => "group_id"
  
belongs_to :person, :class_name => "Person", :foreign_key => "person_id"

end
