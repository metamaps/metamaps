class UserPreference
  attr_accessor :metacodes, :metacode_focus

  def initialize
    array = []
    %w(Action Aim Idea Question Note Wildcard Subject).each do |m|
      metacode = Metacode.find_by_name(m)
      array.push(metacode.id.to_s) if metacode
    end
    @metacodes = array
    @metacode_focus = array[0]
  end
end
