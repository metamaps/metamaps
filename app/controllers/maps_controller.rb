class MapsController < ApplicationController
  
  before_filter :require_user, only: [:new, :create, :edit, :update, :savelayout, :destroy]
    
  respond_to :html, :js, :json
  
  autocomplete :map, :name, :full => true, :extra_data => [:user_id]
  
  # GET /maps/recent
  # GET /maps/featured
  # GET /maps/new
  # GET /maps/mappers/:id
  def index
    
    if request.path == "/maps"
      redirect_to activemaps_url and return
    end
    
    @current = current_user
    @user = nil
    
    if request.path =="/maps/active"
      @maps = Map.order("updated_at DESC").limit(20)
      @request = "active"
      
    elsif request.path =="/maps/featured"
      @maps = Map.order("name ASC").find_all_by_featured(true)
      @request = "featured"
      
    elsif request.path == "/maps/new"
      @maps = Map.order("created_at DESC").limit(20)
      @request = "new"
      
    elsif request.path.index('/maps/mappers/') != nil  # looking for maps by a mapper
      @user = User.find(params[:id])
      @maps = Map.order("name ASC").find_all_by_user_id(@user.id)
      @request = "you" if authenticated? && @user == @current
      @request = "other" if authenticated? && @user != @current
      
    elsif request.path.index('/maps/topics/') != nil  # looking for maps by a certain topic they include
      @topic = Topic.find(params[:id]).authorize_to_show(@current)
      if !@topic
        redirect_to featuredmaps_url, notice: "Access denied." and return
      end
      @maps = @topic.maps
      @request = "topic"
    end
    
    #read this next line as 'delete a map if its private and you're either 1. logged out or 2. logged in but not the map creator
    @maps.delete_if {|m| m.permission == "private" && (!authenticated? || (authenticated? && @current.id != m.user_id)) }
    
	  respond_with(@maps, @request, @user)
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
  
  # GET maps/:id/embed
  def embed
  	
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
  
  # GET maps/:id/json
  def json
  	
	  @current = current_user
	  @map = Map.find(params[:id]).authorize_to_show(@current)
	
	  if not @map
	    redirect_to root_url and return
	  end
		
	  respond_to do |format|
      format.json { render :json => @map.self_as_json(@current) }
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

    #this variable specifies to the js file whether it's a brand new map or a forked one
    @forked = false    
	  
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

      if params[:map][:synapsesToMap]
        @synAll = params[:map][:synapsesToMap]
        @synAll = @synAll.split(',')
        @synAll.each do |synapse_id|
          @mapping = Mapping.new()
          @mapping.category = "Synapse"
          @mapping.user = @user
          @mapping.map = @map
          @mapping.synapse = Synapse.find(synapse_id)
          @mapping.save
        end
      end

      @map.arranged = true
      @map.save
      
      @forked = true
    end
    
    respond_to do |format|
      format.js { respond_with(@map, @forked) }
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
	  @current = current_user
	  @map = Map.find(params[:id]).authorize_to_edit(@current)
    
	  if @map 
        if params[:map]
          @map.name = params[:map][:name] if params[:map][:name]
		      @map.desc = params[:map][:desc] if params[:map][:desc]
		      @map.permission = params[:map][:permission] if params[:map][:permission]
        end
	    @map.save
    end

    respond_with @map
  end
  
  # PUT maps/:id/savelayout
  def savelayout
    @user = current_user
    @map = Map.find(params[:id])
  
    if params[:map][:coordinates]
      @all = params[:map][:coordinates]
      @all = @all.split(',')
      @all.each do |topic|
        topic = topic.split('/')
        @mapping = Mapping.find(topic[0])
        if @mapping
          @mapping.xloc = topic[1]
          @mapping.yloc = topic[2]
          @mapping.save
          
          #push realtime update for location on map
          @mapping.message 'update',@user.id
        end
      end
      @map.arranged = true
      @map.save
    end	
  end
  
  # DELETE maps/:id
  def destroy
    @current = current_user
  
	  @map = Map.find(params[:id])
	
	  @mappings = @map.mappings
	
	  @mappings.each do |mapping| 
		  mapping.delete
	  end
	
	  @map.delete
	
	  respond_to do |format|
        format.html { redirect_to "/maps/mappers/" + @current.id.to_s }
    end
  end
end
