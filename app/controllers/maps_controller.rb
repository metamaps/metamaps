# frozen_string_literal: true
class MapsController < ApplicationController
  before_action :require_user, only: [:create, :update, :destroy, :access, :events, :screenshot, :star, :unstar]
  before_action :set_map, only: [:show, :update, :destroy, :access, :contains, :events, :export, :screenshot, :star, :unstar]
  after_action :verify_authorized

  respond_to :html, :json, :csv

  autocomplete :map, :name, full: true, extra_data: [:user_id]

  # GET maps/:id
  def show
    respond_to do |format|
      format.html do
        @allmappers = @map.contributors
        @allcollaborators = @map.editors
        @alltopics = policy_scope(@map.topics)
        @allsynapses = policy_scope(@map.synapses)
        @allmappings = policy_scope(@map.mappings)
        @allmessages = @map.messages.sort_by(&:created_at)
        @allstars = @map.stars

        respond_with(@allmappers, @allcollaborators, @allmappings, @allsynapses, @alltopics, @allmessages, @allstars, @map)
      end
      format.json { render json: @map }
      format.csv { redirect_to action: :export, format: :csv }
      format.xls { redirect_to action: :export, format: :xls }
    end
  end

  # GET maps/new
  def new
    @map = Map.new(name: 'Untitled Map', permission: 'public', arranged: true)
    authorize @map

    respond_to do |format|
      format.html do
        @map.user = current_user
        @map.save
        redirect_to(map_path(@map) + '?new')
      end
    end
  end

  # POST maps
  def create
    @user = current_user
    @map = Map.new(create_map_params)
    @map.user = @user
    @map.arranged = false

    if params[:topicsToMap].present?
      create_topics!
      create_synapses! if params[:synapsesToMap].present?
      @map.arranged = true
    end

    authorize @map

    respond_to do |format|
      if @map.save
        format.json { render json: @map }
      else
        format.json { render json: 'invalid params' }
      end
    end
  end

  # PUT maps/:id
  def update
    respond_to do |format|
      if @map.update_attributes(update_map_params)
        format.json { head :no_content }
      else
        format.json { render json: @map.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE maps/:id
  def destroy
    @map.delete

    respond_to do |format|
      format.json do
        head :no_content
      end
    end
  end

  # POST maps/:id/access
  def access
    user_ids = params[:access] || []

    added = @map.add_new_collaborators(user_ids)
    added.each do |user_id|
      MapMailer.invite_to_edit_email(@map, current_user, User.find(user_id)).deliver_later
    end
    @map.remove_old_collaborators(user_ids)

    respond_to do |format|
      format.json do
        render json: { message: 'Successfully altered edit permissions' }
      end
    end
  end

  # GET maps/:id/contains
  def contains
    respond_to do |format|
      format.json { render json: @map.contains(current_user) }
    end
  end

  # GET maps/:id/export
  def export
    exporter = MapExportService.new(current_user, @map)
    respond_to do |format|
      format.json { render json: exporter.json }
      format.csv { send_data exporter.csv }
      format.xls { @spreadsheet = exporter.xls }
    end
  end

  # POST maps/:id/events/:event
  def events
    valid_event = false
    if params[:event] == 'conversation'
      Events::ConversationStartedOnMap.publish!(@map, current_user)
      valid_event = true
    elsif params[:event] == 'user_presence'
      Events::UserPresentOnMap.publish!(@map, current_user)
      valid_event = true
    end

    respond_to do |format|
      format.json do
        head :bad_request unless valid_event
        head :ok
      end
    end
  end

  # POST maps/:id/upload_screenshot
  def screenshot
    @map.base64_screenshot(params[:encoded_image])

    if @map.save
      render json: { message: 'Successfully uploaded the map screenshot.' }
    else
      render json: { message: 'Failed to upload image.' }
    end
  end

  # POST maps/:id/star
  def star
    star = Star.find_or_create_by(map_id: @map.id, user_id: current_user.id)

    respond_to do |format|
      format.json do
        render json: { message: 'Successfully starred map' }
      end
    end
  end

  # POST maps/:id/unstar
  def unstar
    star = Star.find_by(map_id: @map.id, user_id: current_user.id)
    star&.delete

    respond_to do |format|
      format.json do
        render json: { message: 'Successfully unstarred map' }
      end
    end
  end

  private

  def set_map
    @map = Map.find(params[:id])
    authorize @map
  end

  def create_map_params
    params.permit(:name, :desc, :permission)
  end

  def update_map_params
    params.require(:map).permit(:id, :name, :arranged, :desc, :permission)
  end

  def create_topics!
    topics = params[:topicsToMap]
    topics = topics.split(',')
    topics.each do |topic|
      topic = topic.split('/')
      mapping = Mapping.new
      mapping.map = @map
      mapping.user = @user
      mapping.mappable = Topic.find(topic[0])
      mapping.xloc = topic[1]
      mapping.yloc = topic[2]
      authorize mapping, :create?
      mapping.save
    end
  end

  def create_synapses!
    @synAll = params[:synapsesToMap]
    @synAll = @synAll.split(',')
    @synAll.each do |synapse_id|
      mapping = Mapping.new
      mapping.map = @map
      mapping.user = @user
      mapping.mappable = Synapse.find(synapse_id)
      authorize mapping, :create?
      mapping.save
    end
  end
end
