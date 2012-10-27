class MapsController < ApplicationController
  
  before_filter :require_user, only: [:new, :create, :edit, :update]
    
  respond_to :html, :js, :json
  
  # GET /users/:user_id/maps
  def index
    @user = User.find(params[:user_id])
	
	@current = current_user
    @maps = Map.visibleToUser(@current, @user)
     
    respond_with(@maps,@user)
  end
  
  # GET /users/:user_id/maps/new
  def new
  	@map = Map.new
    @user = current_user
    
    respond_with(@map)
  end
  
  # GET Get /users/:user_id/maps/:id
  def show
    @user = User.find(params[:user_id])
  	
	@current = current_user
	@map = @user.maps.find(params[:id]).authorize_to_show(@current)
	
	if not @map
	  redirect_to root_url and return
	end
		
	@mapjson = @map.self_as_json(@current).html_safe
	
	respond_to do |format|
      format.html { respond_with(@map, @user) }
      format.json { respond_with(@mapjson) }
    end
  end
  
  # POST /users/:user_id/maps
  def create
    
    @user = current_user
	@map = Map.create(params[:map])
    @map.user = @user    
	
	@map.save   
    
    respond_to do |format|
      format.html { respond_with(@user, location: user_map_path(@user, @map)) }
    end
    
  end
  
  # GET /users/:user_id/maps/:id/edit
  def edit
	@user = User.find(params[:user_id])
  	
	@current = current_user
	@map = @user.maps.find(params[:id]).authorize_to_edit(@current)
	
	if not @map
	  redirect_to root_url and return
	end
  
	respond_with(@user, @map)
  end
  
  # PUT /users/:user_id/maps/:id
  def update
	@user = User.find(params[:user_id])
  	
	@map = @user.maps.find(params[:id])
    
	@map.attributes = params[:map]
	@map.save
	
    respond_with(@user, location: user_map_path(@user, @map)) do |format|
    end
	
  end
  
  # DELETE /users/:user_id/maps/:id
  def destroy
	@user = User.find(params[:user_id])
  	
	@map = @user.maps.find(params[:id])
	
	@mappings = @map.mappings
	
	@mappings.each do |mapping| 
		mapping.delete
	end
	
	@map.delete
	
	respond_with(location: user_maps_path(@user)) do |format|
    end
  end
  
end
