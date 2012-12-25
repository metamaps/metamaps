class ItemsController < ApplicationController
  
  before_filter :require_user, only: [:new, :create, :edit, :update]
    
  respond_to :html, :js, :json
  
  autocomplete :item, :name, :full => true, :extra_data => [:user_id]
  
  
  # GET items
  # or GET /users/:user_id/items
  def index
    @current = current_user
    
    if params[:user_id]
      @user = User.find(params[:user_id])
  	  @items = Item.order("name ASC").visibleToUser(@current, @user)
    elsif      
      @items = Item.order("name ASC").visibleToUser(@current, nil)
    end
     
    respond_with(@user,@items)
  end
  
  # Get items/new
  def new
  	@item = Item.new
    @user = current_user
    
    respond_with(@item)
  end
  
  # GET items/:id
  def show
    @current = current_user
	  @item = Item.find(params[:id]).authorize_to_show(@current)
	
	  if @item
		  @relatives = @item.network_as_json(@current).html_safe
	  else
		  redirect_to root_url and return
	  end
	
	  respond_to do |format|
      format.html { respond_with(@item, @user) }
      format.json { respond_with(@relatives) }
    end
  end
  
  # POST items
  def create
    
    @user = current_user
    
    # if the topic exists grab it and return it
    if params[:item][:grabItem] != "null"
        @item = Item.find(params[:item][:grabItem])
    # if the topic doesn't exist yet, create it
    else
      @item = Item.new()
      @item.name = params[:item][:name]
      @item.desc = ""
      @item.link = ""
      @item.permission = 'commons'
      @item.item_category = ItemCategory.find_by_name(params[:item][:metacode])
      @item.user = @user

      @item.save
    end

    # pass on to the item create js whether it's being created with a synapse
    @synapse = "false"
    if params[:item][:addSynapse] == "true"
      @synapse = "true" 
    end		

    # also create an object to return the position to the canvas
    @position = Hash.new()
    @position['x'] = params[:item][:x]
    @position['y'] = params[:item][:y]
    
    # set this for the case where the item is being created on a map.
    @mapping = Mapping.new()
    if params[:item][:map]
      @mapping.category = "Item"
      @mapping.user = @user
      @mapping.map = Map.find(params[:item][:map])
      @mapping.item = @item
      @mapping.xloc = params[:item][:x]
      @mapping.yloc = params[:item][:y]
      @mapping.save
    end
    
    respond_to do |format|
      format.html { respond_with(@user, location: item_url(@item)) }
      format.js { respond_with(@item, @mapping, @synapse, @position) }
    end
  end
  
  # GET items/:id/edit
  def edit
	  @current = current_user
	  @item = Item.find(params[:id]).authorize_to_edit(@current)
	
	  if not @item
		  redirect_to root_url and return
	  end
  
	  respond_with(@item)
  end
  
  # PUT items/:id
  def update
	  @current = current_user
	  @item = Item.find(params[:id]).authorize_to_edit(@current)
    
	  if @item 
		  @item.name = params[:item][:name]
		  @item.desc = params[:item][:desc]
		  @item.link = params[:item][:link]
		  @item.permission = params[:item][:permission]
		  @item.item_category = ItemCategory.find(params[:category][:item_category_id])
	    @item.save
    end
	
    respond_with(@user, location: item_url(@item)) do |format|
    end
  end
  
  # DELETE items/:id
  def destroy
	  @current = current_user
	  @item = Item.find(params[:id]).authorize_to_edit(@current)
	  
    if @item 
      @synapses = @item.synapses
      @mappings = @item.mappings
    
      @synapses.each do |synapse| 
        synapse.delete
      end
    
      @mappings.each do |mapping| 
        mapping.delete
      end
    
      @item.delete
    end
      
	  respond_to do |format|
      format.js
    end
  end
end
