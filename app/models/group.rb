class Group < ActiveRecord::Base

belongs_to :user

has_many :groupgroup_c, :foreign_key => 'parent_group_id', :class_name => 'Groupgroup'
has_many :groupgroup_p, :foreign_key => 'group_id', :class_name => 'Groupgroup'
  
has_many :grouppeople
has_many :groupitems

has_many :child_groups, :through => :groupgroup_c, :source => :group
has_many :parent_groups, :through => :groupgroup_p, :source => :parent_group

has_many :people, :through => :grouppeople
has_many :items, :through => :groupitems

end
