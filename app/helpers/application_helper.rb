module ApplicationHelper  
  def get_metacodeset
    @m = user.settings.metacodes
    set = @m[0].include?("metacodeset") ? MetacodeSet.find(@m[0].sub("metacodeset-","").to_i) : false
    return set
  end

  def user_metacodes
    @m = user.settings.metacodes
    set = get_metacodeset
    if set
      @metacodes = set.metacodes.to_a
    else
      @metacodes = Metacode.where(id: @m).to_a
    end
    @metacodes.sort! {|m1,m2| m2.name.downcase <=> m1.name.downcase }.rotate!(-1)
  end
end
