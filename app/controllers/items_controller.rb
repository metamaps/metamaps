class ItemsController < ApplicationController

  before_filter :require_user, only: [:new, :create, :edit, :update]
    
  respond_to :html, :js, :json
  
  # GET /items
  def index
    @user = current_user
    @items = Item.all
     
    respond_with(@items)
  end
  
  # Get /item/new
  def new
  	@item = Item.new
    @user = current_user
    
    respond_with(@item)
  end
  
  # GET /item/:id
  def show
  	@item = Item.find(params[:id])
	
	@relatives = @item.map_as_json.html_safe
	
	respond_to do |format|
      format.html { respond_with(@item) }
      format.json { respond_with(@relatives) }
    end
  end
  
  # POST /items
  def create
    
    @user = current_user
	@item = Item.new()
	@item.name = params[:item][:name]
	@item.desc = params[:item][:desc]
	@item.link = params[:item][:link]
	@item.item_category = ItemCategory.find(params[:category])
    @item.user = @user
	
	@item.save   
    
    respond_to do |format|
      format.html { respond_with(@user, location: item_url(@item)) }
      format.js { respond_with(@item) }
    end
    
  end
  
  # GET /items/:id/edit
  def edit
	@item = Item.find_by_id(params[:id])
  
	respond_with(@item)
  end
  
  # PUT /actions/:id
  def update
	@item = Item.find_by_id(params[:id])
    
	if @item 
		@item.name = params[:item][:name]
		@item.desc = params[:item][:desc]
		@item.link = params[:item][:link]
		@item.item_category = ItemCategory.find(params[:category][:item_category_id])
	
		@item.save
    end
	
    respond_with(@user, location: item_url(@item)) do |format|
    end
	
  end
  
  # DELETE /items/:id
  def destroy
	@item = Item.find_by_id(params[:id])
	
	@synapses = @item.synapses
	
	@synapses.each do |synapse| 
		synapse.delete
	end
	
	@item.delete
	
	respond_to do |format|
      format.js
    end
  end
  
end
