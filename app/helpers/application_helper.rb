# frozen_string_literal: true
module ApplicationHelper
  def metacodeset
    metacodes = current_user.settings.metacodes
    return false unless metacodes[0].include?('metacodeset')
    if metacodes[0].sub('metacodeset-', '') == 'Most'
      return 'Most'
    elsif metacodes[0].sub('metacodeset-', '') == 'Recent'
      return 'Recent'
    end
    MetacodeSet.find(metacodes[0].sub('metacodeset-', '').to_i)
  end

  def user_metacodes
    @m = current_user.settings.metacodes
    set = metacodeset
    @metacodes = if set && set == 'Most'
                   Metacode.where(id: current_user.most_used_metacodes).to_a
                 elsif set && set == 'Recent'
                   Metacode.where(id: current_user.recent_metacodes).to_a
                 elsif set
                   set.metacodes.to_a
                 else
                   Metacode.where(id: @m).to_a
                 end
    @metacodes.sort! { |m1, m2| m2.name.downcase <=> m1.name.downcase }.rotate!(-1)
  end

  def user_most_used_metacodes
    @metacodes = current_user.most_used_metacodes.map { |id| Metacode.find(id) }
  end

  def user_recent_metacodes
    @metacodes = current_user.recent_metacodes.map { |id| Metacode.find(id) }
  end

  def invite_link
    "#{request.base_url}/join" + (current_user ? "?code=#{current_user.code}" : '')
  end
end
