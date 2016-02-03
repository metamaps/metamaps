class UserPreference
  attr_accessor :metacodes
 
  def initialize
    array = []
    Metacode.all.each do |m|
      array.push(m.id.to_s)
    end
    @metacodes = array
  end
end