class Person < ActiveRecord::Base

belongs_to :user

has_many :grouppeople
has_many :personitems

has_many :groups, :through => :grouppeople
has_many :items, :through => :personitems

end
