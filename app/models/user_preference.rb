class UserPreference
  attr_accessor :metacodes

  def initialize
    array = []
    Metacode.all.find_each do |m|
      array.push(m.id.to_s)
    end
    @metacodes = array
  end
end
