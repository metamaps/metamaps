class MapsController < ApplicationController
  
  before_filter :require_user, only: [:new, :create, :edit, :update, :savelayout]
    
  respond_to :html, :js, :json
  
  autocomplete :map, :name, :full => true, :extra_data => [:user_id]
  
  # GET /maps
  # or GET /users/:user_id/maps
  def index
    
    @current = current_user
    
    if params[:user_id]
      @user = User.find(params[:user_id])
      @maps = Map.order("name ASC").visibleToUser(@current, @user)
    elsif 
      @maps = Map.order("name ASC").visibleToUser(@current, nil)
    end
    
	  respond_with(@maps,@user)
  end
  
  # GET maps/new
  def new
  	@map = Map.new
    @user = current_user
    
    respond_with(@map)
  end
  
  # GET maps/:id
  def show
  	
	  @current = current_user
	  @map = Map.find(params[:id]).authorize_to_show(@current)
	
	  if not @map
	    redirect_to root_url and return
	  end
		
	  @mapjson = @map.self_as_json(@current).html_safe
	
	  respond_to do |format|
      format.html { respond_with(@map, @user) }
      format.json { respond_with(@mapjson) }
    end
  end
  
  # POST maps
  def create
    
    @user = current_user
	  @map = Map.new()
    @map.name = params[:map][:name]
    @map.desc = params[:map][:desc]
    @map.permission = params[:map][:permission]
    @map.user = @user
    @map.arranged = false    
    @map.save    
	  
    if params[:map][:topicsToMap]
		  @all = params[:map][:topicsToMap]
  		@all = @all.split(',')
		  @all.each do |topic|
			  topic = topic.split('/')
			  @mapping = Mapping.new()
        @mapping.category = "Topic"
        @mapping.user = @user
        @mapping.map  = @map
        @mapping.topic = Topic.find(topic[0])
        @mapping.xloc = topic[1]
        @mapping.yloc = topic[2]
        @mapping.save
		  end
		  @map.arranged = true
      @map.save
      respond_to do |format|
        format.js { respond_with(@map) }
      end
    else
      respond_to do |format|
        format.html { respond_with(@user, location: map_path(@map)) }
      end
	  end	
  end
  
  # GET maps/:id/edit
  def edit
	  @current = current_user
	  @map = Map.find(params[:id]).authorize_to_edit(@current)
	
	  if not @map
	    redirect_to root_url and return
	  end
	
	  @outtopics = @map.topics.order("name ASC").delete_if{|topic| not topic.authorize_to_view(@current)}
  
	  respond_with(@user, @map, @outtopics)
  end
  
  # PUT maps/:id
  def update
	  @map = Map.find(params[:id])
    
	  @map.attributes = params[:map]
	  @map.save
	
	  if params[:outtopics]
		  @outtopics = params[:outtopics]
		  @outtopics.each do |topic|
			  @mapping = Mapping.where("map_id = ? AND topic_id = ?", @map.id, topic).first
			  @mapping.delete
		  end
	  end
	
    respond_with(@user, location: map_path(@map)) do |format|
    end
  end
  
  # PUT maps/:id/savelayout
  def savelayout
	  @map = Map.find(params[:id])
	
	  if params[:map][:coordinates]
		  @all = params[:map][:coordinates]
  		@all = @all.split(',')
		  @all.each do |topic|
			  topic = topic.split('/')
			  @mapping = Mapping.find(topic[0])
			  @mapping.xloc = topic[1]
			  @mapping.yloc = topic[2]
			  @mapping.save
		  end
		  @map.arranged = true
		  @map.save
	  end	
  end
  
  # GET maps/:id/realtime
  def realtime
  	@current = current_user
	  @map = Map.find(params[:id])
		
	  @mapjson = @map.self_as_json(@current).html_safe
	  
	  respond_to do |format|
      format.js { respond_with(@mapjson) }
    end
  end
  
  # DELETE maps/:id
  def destroy
	  @map = Map.find(params[:id])
	
	  @mappings = @map.mappings
	
	  @mappings.each do |mapping| 
		  mapping.delete
	  end
	
	  @map.delete
	
	  respond_to do |format|
        format.js
    end
  end
end
