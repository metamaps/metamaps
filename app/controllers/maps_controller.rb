# frozen_string_literal: true
class MapsController < ApplicationController
  before_action :require_user, only: [:create, :update, :destroy, :events]
  before_action :set_map, only: [:show, :update, :destroy, :contains, :events, :export]
  after_action :verify_authorized

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
        @allrequests = @map.access_requests
      end
      format.json { render json: @map }
      format.csv { redirect_to action: :export, format: :csv }
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
    @map = Map.new(create_map_params)
    @map.user = current_user
    @map.arranged = false
    authorize @map

    if params[:topicsToMap].present?
      create_topics!
      create_synapses! if params[:synapsesToMap].present?
      @map.arranged = true
    end

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

  # GET maps/:id/contains
  def contains
    respond_to do |format|
      format.json { render json: @map.contains(current_user).to_json(user: current_user) }
    end
  end

  # GET maps/:id/export
  def export
    exporter = MapExportService.new(current_user, @map)
    respond_to do |format|
      format.json { render json: exporter.json }
      format.csv { send_data exporter.csv }
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

  private

  def set_map
    @map = Map.find(params[:id])
    authorize @map
  end

  def create_map_params
    params.permit(:name, :desc, :permission)
  end

  def update_map_params
    params.require(:map).permit(:id, :name, :arranged, :desc, :permission, :screenshot)
  end

  def create_topics!
    params[:topicsToMap].split(',').each do |topic|
      topic = topic.split('/')
      mapping = Mapping.new(map: @map, user: current_user,
                            mappable: Topic.find(topic[0]),
                            xloc: topic[1], yloc: topic[2])
      authorize mapping, :create?
      mapping.save
    end
  end

  def create_synapses!
    params[:synapsesToMap].split(',').each do |synapse_id|
      mapping = Mapping.new(map: @map, user: current_user,
                            mappable: Synapse.find(synapse_id))
      authorize mapping, :create?
      mapping.save
    end
  end
end
