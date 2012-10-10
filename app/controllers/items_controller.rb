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
	@relatives = @item.as_json.html_safe
	@ichildren = @item.child_items
	
	respond_to do |format|
      format.html { respond_with(@item, @gparents, @pparents, @iparents, @ichildren) }
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
	
	@ingroups = @item.groups
	if @ingroups.count > 0
		@outgroups = Group.find(:all, :conditions => ['id not in (?)', @ingroups.map(&:id)])
	else
		@outgroups = Group.all
	end
	
	@inpeople = @item.people
	if @inpeople.count > 0
		@outpeople = Person.find(:all, :conditions => ['id not in (?)', @inpeople.map(&:id)])
	else
		@outpeople = Person.all
	end
	
	@initems1 = @item.parent_items
	if @initems1.count > 0
		@outitems1 = Item.find(:all, :conditions => ['id not in (?) AND id != ?', @initems1.map(&:id), @item.id])
	else
		@outitems1 = Item.find(:all, :conditions => ['id != ?', @item.id])
	end
	
	@initems2 = @item.child_items
	if @initems2.count > 0
		@outitems2 = Item.find(:all, :conditions => ['id not in (?) AND id != ?', @initems2.map(&:id), @item.id])
	else
		@outitems2 = Item.find(:all, :conditions => ['id != ?', @item.id])
	end
  
	respond_with(@item, @initems1, @outitems1, @initems2, @outitems2, @ingroups, @outgroups, @inpeople, @outpeople)
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
	
	if params[:ingroups]
		@ingroups = params[:ingroups]
		@ingroups.each do |g|
			@connection = Groupitem.where("group_id = ? AND item_id = ?", g, @item.id).first
			@connection.delete
		end
	end
	
	if params[:outgroups]
		@outgroups = params[:outgroups]
		@outgroups.each do |g|
			belongs = Groupitem.new
			belongs.group_id = g
			belongs.item_id = @item.id
			belongs.save!    
		end 
	end
	
	if params[:inpeople]
		@inpeople = params[:inpeople]
		@inpeople.each do |g|
			@connection = Personitem.where("person_id = ? AND item_id = ?", g, @item.id).first
			@connection.delete
		end
	end
	
	if params[:outpeople]
		@outpeople = params[:outpeople]
		@outpeople.each do |g|
			belongs = Personitem.new
			belongs.person_id = g
			belongs.item_id = @item.id
			belongs.save!    
		end 
	end
	
	#remove the selected parent items
	if params[:initems1]
		@initems1 = params[:initems1]
		@initems1.each do |g|
			@connection = Itemitem.where("parent_item_id = ? AND item_id = ?", g, @item.id).first
			@connection.delete
		end
	end
	
	#remove the selected parent items
	if params[:outitems1]
		@outitems1 = params[:outitems1]
		@outitems1.each do |g|
			belongs = Itemitem.new
			belongs.parent_item_id = g
			belongs.item_id = @item.id
			belongs.save!    
		end 
	end
	
	#remove the selected children items
	if params[:initems2]
		@initems2 = params[:initems2]
		@initems2.each do |g|
			@connection = Itemitem.where("parent_item_id = ? AND item_id = ?", @item.id, g).first
			@connection.delete
		end
	end
	
	#add the selected children items
	if params[:outitems2]
		@outitems2 = params[:outitems2]
		@outitems2.each do |g|
			belongs = Itemitem.new
			belongs.parent_item_id = @item.id
			belongs.item_id = g
			belongs.save!    
		end 
	end
	
    respond_with(@user, location: item_url(@item)) do |format|
    end
	
  end
  
  # DELETE /items/:id
  def destroy
	@item = Item.find_by_id(params[:id])
	
	@item.delete
  end
  
end
