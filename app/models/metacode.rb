class Metacode < ActiveRecord::Base
  has_many :in_metacode_sets
  has_many :metacode_sets, :through => :in_metacode_sets 
  has_many :topics

  def hasSelected(user)
    return true if user.settings.metacodes.include? self.id.to_s
    return false
  end
    
  def inMetacodeSet(metacode_set)
    return true if self.metacode_sets.include? metacode_set
    return false
  end
end
