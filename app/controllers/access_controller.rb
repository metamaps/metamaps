# frozen_string_literal: true

class AccessController < ApplicationController
  before_action :require_user, only: %i[access access_request
                                        approve_access approve_access_post
                                        deny_access deny_access_post request_access]
  before_action :set_map, only: %i[access access_request
                                   approve_access approve_access_post
                                   deny_access deny_access_post request_access]
  after_action :verify_authorized

  # GET maps/:id/request_access
  def request_access
    @map = nil
    respond_to do |format|
      format.html do
        render 'maps/request_access'
      end
    end
  end

  # POST maps/:id/access_request
  def access_request
    AccessRequest.create(user: current_user, map: @map)
    respond_to do |format|
      format.json { head :ok }
    end
  end

  # POST maps/:id/access
  def access
    user_ids = params[:access].to_a.map(&:to_i) || []

    @map.add_new_collaborators(user_ids)
    @map.remove_old_collaborators(user_ids)

    respond_to do |format|
      format.json { head :ok }
    end
  end

  # GET maps/:id/approve_access/:request_id
  def approve_access
    request = AccessRequest.find(params[:request_id])
    request.approve # also marks mailboxer notification as read
    respond_to do |format|
      format.html { redirect_to map_path(@map), notice: 'Request was approved' }
    end
  end

  # GET maps/:id/deny_access/:request_id
  def deny_access
    request = AccessRequest.find(params[:request_id])
    request.deny # also marks mailboxer notification as read
    respond_to do |format|
      format.html { redirect_to map_path(@map), notice: 'Request was turned down' }
    end
  end

  # POST maps/:id/approve_access/:request_id
  def approve_access_post
    request = AccessRequest.find(params[:request_id])
    request.approve
    respond_to do |format|
      format.js
      format.json do
        head :ok
      end
    end
  end

  # POST maps/:id/deny_access/:request_id
  def deny_access_post
    request = AccessRequest.find(params[:request_id])
    request.deny
    respond_to do |format|
      format.js
      format.json do
        head :ok
      end
    end
  end

  private

  def set_map
    @map = Map.find(params[:id])
    authorize @map
  end
end
