class MetacodeSet < ActiveRecord::Base
  belongs_to :user
  attr_accessible :desc, :mapperContributed, :name
  has_many :in_metacode_sets
  has_many :metacodes, :through => :in_metacode_sets
end
