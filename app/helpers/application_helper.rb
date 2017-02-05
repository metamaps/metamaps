# frozen_string_literal: true
module ApplicationHelper
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

    focus_code = user_metacode()
    if focus_code != nil && @metacodes.index{|m| m.id == focus_code.id} == nil
      @metacodes.push(focus_code)
    end

    @metacodes
      .sort! { |m1, m2| m2.name.downcase <=> m1.name.downcase }

    if focus_code != nil
      @metacodes.rotate!(@metacodes.index{|m| m.id == focus_code.id})
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

  def invite_link
    "#{request.base_url}/join" + (current_user ? "?code=#{current_user.code}" : '')
  end

  def user_unread_notification_count
    return 0 if current_user.nil?
    @uunc ||= current_user.mailboxer_notification_receipts.reduce(0) do |total, receipt|
      receipt.is_read ? total : total + 1
    end
  end
end
