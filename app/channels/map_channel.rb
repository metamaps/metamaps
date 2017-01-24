# frozen_string_literal: true
class MapChannel < ApplicationCable::Channel
  # Called when the consumer has successfully
  # become a subscriber of this channel.
  def subscribed
    return unless Pundit.policy(current_user, Map.find(params[:id])).show?
    stream_from "map_#{params[:id]}"
  end
end
