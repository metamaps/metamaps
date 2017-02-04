# frozen_string_literal: true
class ConversationsController < ApplicationController

  def conversation
    @maps = map_scope(Map.where.not(name: 'Untitled Map').where.not(permission: 'private'))

    respond_to do |format|
      format.html do
        # root url => main/home. main/home renders maps/activemaps view.
        redirect_to(root_url) && return if authenticated?
        respond_with(@maps, @user)
      end
      format.json { render json: @maps.to_json }
    end
  end
  
end