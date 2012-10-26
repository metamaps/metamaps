class ItemsController < ApplicationController

  before_filter :require_user, only: [:new, :create, :edit, :update]
    
  respond_to :html, :js, :json
  
  # GET /users/:user_id/items
  def index
	@user = User.find(params[:user_id])
  	
	@items = @user.items
     
    respond_with(@user,@items)
  end
  
  # Get /users/:user_id/items/new
  def new
  	@item = Item.new
    @user = current_user
    
    respond_with(@item)
  end
  
  # GET /users/:user_id/items/:id
  def show
    @user = User.find(params[:user_id])
  	
	@item = @user.items.find(params[:id])
	
	@relatives = @item.network_as_json.html_safe
	
	respond_to do |format|
      format.html { respond_with(@item, @user) }
      format.json { respond_with(@relatives) }
    end
  end
  
  # POST /users/:user_id/items
  def create
    
    @user = current_user
	@item = Item.new()
	@item.name = params[:item][:name]
	@item.desc = params[:item][:desc]
	@item.link = params[:item][:link]
	@item.permission = params[:item][:permission]
	@item.item_category = ItemCategory.find(params[:category])
    @item.user = @user
	
	@item.save   
	
	if params[:item][:map]
		@mapping = Mapping.new()
		@mapping.category = "Item"
		@mapping.user = @user
		@mapping.map = Map.find(params[:item][:map])
		@mapping.item = @item
		@mapping.save
	end
    
    respond_to do |format|
      format.html { respond_with(@user, location: user_item_url(@user, @item)) }
      format.js { respond_with(@item) }
    end
    
  end
  
  # GET /users/:user_id/items/:id/edit
  def edit
	@user = User.find(params[:user_id])
  	
	@item = @user.items.find(params[:id])
  
	respond_with(@item)
  end
  
  # PUT /users/:user_id/items/:id
  def update
	@user = User.find(params[:user_id])
  	
	@item = @user.items.find(params[:id])
    
	if @item 
		@item.name = params[:item][:name]
		@item.desc = params[:item][:desc]
		@item.link = params[:item][:link]
		@item.permission = params[:item][:permission]
		@item.item_category = ItemCategory.find(params[:category][:item_category_id])
	
		@item.save
    end
	
    respond_with(@user, location: user_item_url(@user, @item)) do |format|
    end
	
  end
  
  # DELETE /users/:user_id/items/:id
  def destroy
	@user = User.find(params[:user_id])
  	
	@item = @user.items.find(params[:id])
	
	@synapses = @item.synapses
	@mappings = @item.mappings
	
	@synapses.each do |synapse| 
		synapse.delete
	end
	
	@mappings.each do |mapping| 
		mapping.delete
	end
	
	@item.delete
	
	respond_to do |format|
      format.js
    end
  end
  
end
