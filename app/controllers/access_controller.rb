# frozen_string_literal: true
class AccessController < ApplicationController
  before_action :require_user, only: [:access, :access_request, :approve_access, :approve_access_post,
                                      :deny_access, :deny_access_post, :request_access]
  before_action :set_map, only: [:access, :access_request, :approve_access, :approve_access_post,
                                 :deny_access, :deny_access_post, :request_access]
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
    request = AccessRequest.create(user: current_user, map: @map)
    # what about push notification to map owner?
    MapMailer.access_request_email(request, @map).deliver_later

    respond_to do |format|
      format.json do
        head :ok
      end
    end
  end

  # POST maps/:id/access
  def access
    user_ids = params[:access] || []

    @map.add_new_collaborators(user_ids).each do |user_id|
      # add_new_collaborators returns array of added users,
      # who we then send an email to
      MapMailer.invite_to_edit_email(@map, current_user, User.find(user_id)).deliver_later
    end
    @map.remove_old_collaborators(user_ids)

    respond_to do |format|
      format.json do
        head :ok
      end
    end
  end

  # GET maps/:id/approve_access/:request_id
  def approve_access
    request = AccessRequest.find(params[:request_id])
    request.approve()
    respond_to do |format|
      format.html { redirect_to map_path(@map), notice: 'Request was approved' }
    end
  end

  # GET maps/:id/deny_access/:request_id
  def deny_access
    request = AccessRequest.find(params[:request_id])
    request.deny()
    respond_to do |format|
      format.html { redirect_to map_path(@map), notice: 'Request was turned down' }
    end
  end

  # POST maps/:id/approve_access/:request_id
  def approve_access_post
    request = AccessRequest.find(params[:request_id])
    request.approve()
    respond_to do |format|
      format.json do
        head :ok
      end
    end
  end

  # POST maps/:id/deny_access/:request_id
  def deny_access_post
    request = AccessRequest.find(params[:request_id])
    request.deny()
    respond_to do |format|
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
