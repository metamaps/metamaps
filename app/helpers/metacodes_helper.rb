# frozen_string_literal: true
module MetacodesHelper
  def metacodeset
    metacodes = current_user.settings.metacodes

    return false unless metacodes[0].include?('metacodeset')
    return 'Most' if metacodes[0].sub('metacodeset-', '') == 'Most'
    return 'Recent' if metacodes[0].sub('metacodeset-', '') == 'Recent'

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

    focus_code = user_metacode
    if !focus_code.nil? && @metacodes.index { |m| m.id == focus_code.id }.nil?
      @metacodes.push(focus_code)
    end

    @metacodes.sort! { |m1, m2| m2.name.downcase <=> m1.name.downcase }

    if !focus_code.nil?
      @metacodes.rotate!(@metacodes.index { |m| m.id == focus_code.id })
    else
      @metacodes.rotate!(-1)
    end
  end

  def user_metacode
    current_user.settings.metacode_focus ? Metacode.find(current_user.settings.metacode_focus.to_i) : nil
  end

  def user_most_used_metacodes
    @metacodes = current_user.most_used_metacodes.map { |id| Metacode.find(id) }
  end

  def user_recent_metacodes
    @metacodes = current_user.recent_metacodes.map { |id| Metacode.find(id) }
  end

  def metacode_sets_json
    metacode_sets = []
    metacode_sets << {
      name: 'Recently Used',
      metacodes: user_recent_metacodes
                     .map { |m| { id: m.id, icon_path: asset_path(m.icon), name: m.name } }
    }
    metacode_sets << {
      name: 'Most Used',
      metacodes: user_most_used_metacodes
                     .map { |m| { id: m.id, icon_path: asset_path(m.icon), name: m.name } }
    }
    metacode_sets += MetacodeSet.order('name').all.map do |set|
      {
        name: set.name,
        metacodes: set.metacodes.order('name')
                      .map { |m| { id: m.id, icon_path: asset_path(m.icon), name: m.name } }
      }
    end
    metacode_sets << {
      name: 'All',
      metacodes: Metacode.order('name').all
                         .map { |m| { id: m.id, icon_path: asset_path(m.icon), name: m.name } }
    }
    metacode_sets.to_json
  end
end
