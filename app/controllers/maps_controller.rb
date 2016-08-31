class MapsController < ApplicationController
  before_action :require_user, only: [:create, :update, :access, :star, :unstar, :screenshot, :events, :destroy]
  after_action :verify_authorized, except: [:activemaps, :featuredmaps, :mymaps, :sharedmaps, :starredmaps, :usermaps, :events]
  after_action :verify_policy_scoped, only: [:activemaps, :featuredmaps, :mymaps, :sharedmaps, :starredmaps, :usermaps]

  respond_to :html, :json, :csv

  autocomplete :map, :name, full: true, extra_data: [:user_id]

  # GET /explore/active
  def activemaps
    page = params[:page].present? ? params[:page] : 1
    @maps = policy_scope(Map).order('updated_at DESC')
                             .page(page).per(20)

    respond_to do |format|
      format.html do
        # root url => main/home. main/home renders maps/activemaps view.
        redirect_to(root_url) && return if authenticated?
        respond_with(@maps, @user)
      end
      format.json { render json: @maps }
    end
  end

  # GET /explore/featured
  def featuredmaps
    page = params[:page].present? ? params[:page] : 1
    @maps = policy_scope(
      Map.where('maps.featured = ? AND maps.permission != ?',
                true, 'private')
    ).order('updated_at DESC').page(page).per(20)

    respond_to do |format|
      format.html { respond_with(@maps, @user) }
      format.json { render json: @maps }
    end
  end

  # GET /explore/mine
  def mymaps
    unless authenticated?
      skip_policy_scope
      return redirect_to explore_active_path
    end

    page = params[:page].present? ? params[:page] : 1
    @maps = policy_scope(
      Map.where('maps.user_id = ?', current_user.id)
    ).order('updated_at DESC').page(page).per(20)

    respond_to do |format|
      format.html { respond_with(@maps, @user) }
      format.json { render json: @maps }
    end
  end

  # GET /explore/shared
  def sharedmaps
    unless authenticated?
      skip_policy_scope
      return redirect_to explore_active_path
    end

    page = params[:page].present? ? params[:page] : 1
    @maps = policy_scope(
      Map.where('maps.id IN (?)', current_user.shared_maps.map(&:id))
    ).order('updated_at DESC').page(page).per(20)

    respond_to do |format|
      format.html { respond_with(@maps, @user) }
      format.json { render json: @maps }
    end
  end

  # GET /explore/starred
  def starredmaps
    unless authenticated?
      skip_policy_scope
      return redirect_to explore_active_path
    end

    page = params[:page].present? ? params[:page] : 1
    stars = current_user.stars.map(&:map_id)
    @maps = policy_scope(
      Map.where('maps.id IN (?)', stars)
    ).order('updated_at DESC').page(page).per(20)

    respond_to do |format|
      format.html { respond_with(@maps, @user) }
      format.json { render json: @maps }
    end
  end

  # GET /explore/mapper/:id
  def usermaps
    page = params[:page].present? ? params[:page] : 1
    @user = User.find(params[:id])
    @maps = policy_scope(Map.where(user: @user))
            .order('updated_at DESC').page(page).per(20)

    respond_to do |format|
      format.html { respond_with(@maps, @user) }
      format.json { render json: @maps }
    end
  end

  # GET maps/new
  def new
    @map = Map.new(name: "Untitled Map", permission: "public", arranged: true)
    authorize @map

    respond_to do |format|
      format.html do
        @map.user = current_user
        @map.save
        redirect_to(map_path(@map) + '?new') 
      end
    end
  end

  # GET maps/:id
  def show
    @map = Map.find(params[:id])
    authorize @map

    respond_to do |format|
      format.html do
        @allmappers = @map.contributors
        @allcollaborators = @map.editors
        @alltopics = @map.topics.to_a.delete_if { |t| !policy(t).show? }
        @allsynapses = @map.synapses.to_a.delete_if { |s| !policy(s).show? }
        @allmappings = @map.mappings.to_a.delete_if { |m| !policy(m).show? }
        @allmessages = @map.messages.sort_by(&:created_at)
        @allstars = @map.stars

        respond_with(@allmappers, @allcollaborators, @allmappings, @allsynapses, @alltopics, @allmessages, @allstars, @map)
      end
      format.json { render json: @map }
      format.csv { redirect_to action: :export, format: :csv }
      format.xls { redirect_to action: :export, format: :xls }
    end
  end

  # GET maps/:id/export
  def export
    map = Map.find(params[:id])
    authorize map
    exporter = MapExportService.new(current_user, map)
    respond_to do |format|
      format.json { render json: exporter.json }
      format.csv { send_data exporter.csv }
      format.xls { @spreadsheet = exporter.xls }
    end
  end

  # POST maps/:id/events/:event
  def events
    map = Map.find(params[:id])
    authorize map

    valid_event = false
    if params[:event] == 'conversation'
      Events::ConversationStartedOnMap.publish!(map, current_user)
      valid_event = true
    elsif params[:event] == 'user_presence'
      Events::UserPresentOnMap.publish!(map, current_user)
      valid_event = true
    end

    respond_to do |format|
      format.json do
        head :ok if valid_event
        head :bad_request unless valid_event
      end
    end
  end

  # GET maps/:id/contains
  def contains
    @map = Map.find(params[:id])
    authorize @map

    @allmappers = @map.contributors
    @allcollaborators = @map.editors
    @alltopics = @map.topics.to_a.delete_if { |t| !policy(t).show? }
    @allsynapses = @map.synapses.to_a.delete_if { |s| !policy(s).show? }
    @allmappings = @map.mappings.to_a.delete_if { |m| !policy(m).show? }

    @json = {}
    @json['map'] = @map
    @json['topics'] = @alltopics
    @json['synapses'] = @allsynapses
    @json['mappings'] = @allmappings
    @json['mappers'] = @allmappers
    @json['collaborators'] = @allcollaborators
    @json['messages'] = @map.messages.sort_by(&:created_at)
    @json['stars'] = @map.stars

    respond_to do |format|
      format.json { render json: @json }
    end
  end

  # POST maps
  def create
    @user = current_user
    @map = Map.new
    @map.name = params[:name]
    @map.desc = params[:desc]
    @map.permission = params[:permission]
    @map.user = @user
    @map.arranged = false

    if params[:topicsToMap]
      @all = params[:topicsToMap]
      @all = @all.split(',')
      @all.each do |topic|
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

      if params[:synapsesToMap]
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

      @map.arranged = true
    end

    authorize @map

    if @map.save
      respond_to do |format|
        format.json { render json: @map }
      end
    else
      respond_to do |format|
        format.json { render json: 'invalid params' }
      end
    end
  end

  # PUT maps/:id
  def update
    @map = Map.find(params[:id])
    authorize @map

    respond_to do |format|
      if @map.update_attributes(map_params)
        format.json { head :no_content }
      else
        format.json { render json: @map.errors, status: :unprocessable_entity }
      end
    end
  end

  # POST maps/:id/access
  def access
    @map = Map.find(params[:id])
    authorize @map
    userIds = params[:access] || []
    added = userIds.select do |uid|
      user = User.find(uid)
      if user.nil? || (current_user && user == current_user)
        false
      else
        !@map.collaborators.include?(user)
      end
    end
    removed = @map.collaborators.select { |user| !userIds.include?(user.id.to_s) }.map(&:id)
    added.each do |uid|
      UserMap.create(user_id: uid.to_i, map_id: @map.id)
      user = User.find(uid.to_i)
      MapMailer.invite_to_edit_email(@map, current_user, user).deliver_later
    end
    removed.each do |uid|
      @map.user_maps.select { |um| um.user_id == uid }.each(&:destroy)
    end

    respond_to do |format|
      format.json do
        render json: { message: 'Successfully altered edit permissions' }
      end
    end
  end

  # POST maps/:id/star
  def star
    @map = Map.find(params[:id])
    authorize @map
    star = Star.find_by_map_id_and_user_id(@map.id, current_user.id)
    if not star
      star = Star.create(map_id: @map.id, user_id: current_user.id)
    end

    respond_to do |format|
      format.json do
        render json: { message: 'Successfully starred map' }
      end
    end
  end

  # POST maps/:id/unstar
  def unstar
    @map = Map.find(params[:id])
    authorize @map
    star = Star.find_by_map_id_and_user_id(@map.id, current_user.id)
    if star
      star.delete
    end

    respond_to do |format|
      format.json do
        render json: { message: 'Successfully unstarred map' }
      end
    end
  end

  # POST maps/:id/upload_screenshot
  def screenshot
    @map = Map.find(params[:id])
    authorize @map

    png = Base64.decode64(params[:encoded_image]['data:image/png;base64,'.length..-1])
    StringIO.open(png) do |data|
      data.class.class_eval { attr_accessor :original_filename, :content_type }
      data.original_filename = 'map-' + @map.id.to_s + '-screenshot.png'
      data.content_type = 'image/png'
      @map.screenshot = data
    end

    if @map.save
      render json: { message: 'Successfully uploaded the map screenshot.' }
    else
      render json: { message: 'Failed to upload image.' }
    end
  end

  # DELETE maps/:id
  def destroy
    @map = Map.find(params[:id])
    authorize @map

    @map.delete

    respond_to do |format|
      format.json do
        head :no_content
      end
    end
  end

  private

  # Never trust parameters from the scary internet, only allow the white list through.
  def map_params
    params.require(:map).permit(:id, :name, :arranged, :desc, :permission)
  end
end
