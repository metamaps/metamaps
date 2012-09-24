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
	
	@gparents = @item.groups
	@pparents = @item.people
	@iparents = @item.parent_items
	@ichildren = @item.child_items
	
	respond_with(@item, @gparents, @pparents, @iparents, @ichildren)
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
      format.html {render :index}
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
    @user = current_user
	@item = Item.find_by_id(params[:id])
    
	if @item 
		@item.name = params[:item][:name]
		@item.desc = params[:item][:desc]
		@item.link = params[:item][:link]
		@item.item_category = ItemCategory.find(params[:category])
		@item.user = @user
	
		@item.save
    end
	
    respond_with(@user, location: restore(default: root_url)) do |format|
    end
  end
  
  # DELETE /actions/:id
  def destroy
	@item = Item.find_by_id(params[:id])
	
	@item.delete
  end
  
end
