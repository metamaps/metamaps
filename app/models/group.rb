class Group < ActiveRecord::Base

belongs_to :user

has_many :groupgroup_c, :foreign_key => 'parent_group_id', :class_name => 'Groupgroup'
has_many :groupgroup_p, :foreign_key => 'group_id', :class_name => 'Groupgroup'

has_many :synapses1, :class_name => 'Synapse', :foreign_key => 'node1_id', :conditions => {:category => 'Group'}
has_many :synapses2, :class_name => 'Synapse', :foreign_key => 'node2_id', :conditions => {:category => 'Group'}
has_many :groups1, :through => :synapses2, :source => :group1
has_many :groups2, :through => :synapses1, :source => :group2
  
  def siblings
     groups1 + groups2
  end 
  
has_many :grouppeople
has_many :groupitems

has_many :child_groups, :through => :groupgroup_c, :source => :group
has_many :parent_groups, :through => :groupgroup_p, :source => :parent_group

has_many :people, :through => :grouppeople
has_many :items, :through => :groupitems

end
