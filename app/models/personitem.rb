class Personitem < ActiveRecord::Base

belongs_to :person, :class_name => "Person", :foreign_key => "person_id"
  
belongs_to :item, :class_name => "Item", :foreign_key => "item_id"

end
