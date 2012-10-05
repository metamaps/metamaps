class Person < ActiveRecord::Base

belongs_to :user

has_many :grouppeople
has_many :personitems

has_many :groups, :through => :grouppeople

has_many :synapses1, :class_name => 'Synapse', :foreign_key => 'node1_id', :conditions => {:category => 'Person'}
has_many :synapses2, :class_name => 'Synapse', :foreign_key => 'node2_id', :conditions => {:category => 'Person'}
has_many :people1, :through => :synapses2, :source => :person1
has_many :people2, :through => :synapses1, :source => :person2
  
  def siblings
     people1 + people2
  end 
  
has_many :items, :through => :personitems

end
