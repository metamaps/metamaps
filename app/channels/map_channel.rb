# frozen_string_literal: true
class MapChannel < ApplicationCable::Channel
  # Called when the consumer has successfully
  # become a subscriber of this channel.
  def subscribed
    map = Map.find(params[:id])
    return unless Pundit.policy(current_user, map).show?
    stream_from "map_#{params[:id]}"
    Events::UserPresentOnMap.publish!(map, current_user)
  end

  def unsubscribed
    map = Map.find(params[:id])
    return unless Pundit.policy(current_user, map).show?
    Events::UserNotPresentOnMap.publish!(map, current_user)
  end
end
