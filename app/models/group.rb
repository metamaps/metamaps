class Group < ActiveRecord::Base

belongs_to :user

has_many :groupgroup_c, :foreign_key => 'parent_group_id', :class_name => 'Groupgroup'
has_many :groupgroup_p, :foreign_key => 'group_id', :class_name => 'Groupgroup'

has_many :synapses1, :class_name => 'Synapse', :foreign_key => 'node1_id', :conditions => {:category => 'Group'}
has_many :synapses2, :class_name => 'Synapse', :foreign_key => 'node2_id', :conditions => {:category => 'Group'}
has_many :groups1, :through => :synapses2, :source => :group1
has_many :groups2, :through => :synapses1, :source => :group2
  
  def synapses
     synapses1 + synapses2
  end
  
  def relatives
     groups1 + groups2
  end
  
has_many :grouppeople
has_many :groupitems

has_many :child_groups, :through => :groupgroup_c, :source => :group
has_many :parent_groups, :through => :groupgroup_p, :source => :parent_group

has_many :people, :through => :grouppeople
has_many :items, :through => :groupitems

  def as_json
    Jbuilder.encode do |json|
	  @data1 = {'$color'=> '#909291'}
	  @data2 = {'$color'=> '#70A35E', '$type'=> 'triangle', '$dim'=> 11 }
	  @single = Array.new
	  @single.push(self)
	  @groups = @single + self.relatives
	  
	  json.array!(@groups) do |group|
	      json.adjacencies group.synapses2.delete_if{|synapse| not @groups.include?(Group.find_by_id(synapse.node1_id))} do |json, synapse|
				json.nodeTo synapse.node1_id
				json.nodeFrom synapse.node2_id
				json.data @data1
		  end
		  
		  json.data @data2
		  json.id group.id
		  json.name group.name
	  end	
    end
  end

end
