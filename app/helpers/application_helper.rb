module ApplicationHelper
  def get_metacodeset
    @m = current_user.settings.metacodes
    set = @m[0].include?('metacodeset') ? MetacodeSet.find(@m[0].sub('metacodeset-', '').to_i) : false
    set
  end

  def user_metacodes
    @m = current_user.settings.metacodes
    set = get_metacodeset
    @metacodes = if set
                   set.metacodes.to_a
                 else
                   Metacode.where(id: @m).to_a
                 end
    @metacodes.sort! { |m1, m2| m2.name.downcase <=> m1.name.downcase }.rotate!(-1)
  end

  def determine_invite_link
    "#{request.base_url}/join" + (current_user ? "?code=#{current_user.code}" : '')
  end
end
