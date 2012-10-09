class Person < ActiveRecord::Base

belongs_to :user

has_many :grouppeople
has_many :personitems

has_many :groups, :through => :grouppeople
has_many :items, :through => :personitems

has_many :synapses1, :class_name => 'Synapse', :foreign_key => 'node1_id', :conditions => {:category => 'Person'}
has_many :synapses2, :class_name => 'Synapse', :foreign_key => 'node2_id', :conditions => {:category => 'Person'}
has_many :people1, :through => :synapses2, :source => :person1
has_many :people2, :through => :synapses1, :source => :person2
  
  def synapses
     synapses1 + synapses2
  end
  
  def relatives
     people1 + people2
  end
  
  def as_json
    Jbuilder.encode do |json|
	  @data1 = {'$color'=> '#909291'}
	  @data2 = {'$color'=> '#70A35E', '$type'=> 'triangle', '$dim'=> 11 }
	  @single = Array.new
	  @single.push(self)
	  @people = @single + self.relatives
	  
	  json.array!(@people) do |person|
	      json.adjacencies person.synapses2 do |json, synapse|
			json.nodeTo synapse.node1_id
			json.nodeFrom synapse.node2_id
			json.data @data1
		  end
		  
		  json.data @data2
		  json.id person.id
		  json.name person.name
	  end	
    end
  end
   
end
