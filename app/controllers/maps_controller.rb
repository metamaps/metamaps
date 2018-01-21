# frozen_string_literal: true

class MapsController < ApplicationController
  before_action :require_user, only: %i[create update destroy events follow unfollow]
  before_action :set_map, only: %i[show conversation update destroy
                                   contains events export
                                   follow unfollow unfollow_from_email]
  after_action :verify_authorized

  # GET maps/:id
  def show
    respond_to do |format|
      format.html do
        UserMap.where(map: @map, user: current_user).map(&:mark_invite_notifications_as_read)
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
      format.ttl { redirect_to action: :export, format: :ttl }
    end
  end

  # GET maps/:id/conversation
  def conversation
    respond_to do |format|
      format.html do
        UserMap.where(map: @map, user: current_user).map(&:mark_invite_notifications_as_read)
        @allmappers = @map.contributors
        @allcollaborators = @map.editors
        @alltopics = policy_scope(@map.topics)
        @allsynapses = policy_scope(@map.synapses)
        @allmappings = policy_scope(@map.mappings)
        @allmessages = @map.messages.sort_by(&:created_at)
        @allstars = @map.stars
        @allrequests = @map.access_requests
      end
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
    @map.updated_by = current_user
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
    @map.updated_by = current_user
    @map.assign_attributes(update_map_params)

    respond_to do |format|
      if @map.save
        format.json { head :no_content }
      else
        format.json { render json: @map.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE maps/:id
  def destroy
    @map.updated_by = current_user
    @map.destroy

    respond_to do |format|
      format.json do
        head :no_content
      end
    end
  end

  # GET maps/:id/contains
  def contains
    respond_to do |format|
      format.json { render json: @map.contains(current_user).as_json(user: current_user) }
    end
  end

  # GET maps/:id/export
  def export
    exporter = MapExportService.new(current_user, @map, base_url: request.base_url)

    respond_to do |format|
      format.json { render json: exporter.json }
      format.csv { send_data exporter.csv }
      format.ttl { render text: exporter.rdf }
    end
  end

  # POST maps/:id/events/:event
  def events
    valid_event = false
    if params[:event] == 'conversation'
      Events::ConversationStartedOnMap.publish!(@map, current_user)
      valid_event = true
    end

    respond_to do |format|
      format.json do
        head :bad_request unless valid_event
        head :ok
      end
    end
  end

  # POST maps/:id/follow
  def follow
    follow = FollowService.follow(@map, current_user, 'followed')

    respond_to do |format|
      format.json do
        if follow
          head :ok
        else
          head :bad_request
        end
      end
    end
  end

  # POST maps/:id/unfollow
  def unfollow
    FollowService.unfollow(@map, current_user)

    respond_to do |format|
      format.json do
        head :ok
      end
    end
  end

  # GET maps/:id/unfollow_from_email
  def unfollow_from_email
    FollowService.unfollow(@map, current_user)

    respond_to do |format|
      format.html do
        redirect_to map_path(@map), notice: 'You are no longer following this map'
      end
    end
  end

  private

  def set_map
    @map = Map.find(params[:id])
    authorize @map
  end

  def create_map_params
    params.permit(:name, :desc, :permission, :source_id)
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
