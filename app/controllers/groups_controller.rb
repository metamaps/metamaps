class GroupsController < ApplicationController

  before_filter :require_user, only: [:new, :create, :edit, :update]
    
  respond_to :html, :js, :json
  
  # GET /groups
  def index
    @user = current_user
    @groups = Group.all
     
    respond_with(@groups)
  end
  
  # Get /groups/new
  def new
  	@group = Group.new
    @user = current_user
    
    respond_with(@group)
  end
  
  # GET /groups/:id
  def show
  	@group = Group.find(params[:id])
	
	@gparents = @group.parent_groups
	@relatives = @group.as_json.html_safe
	@gchildren = @group.child_groups
	@pchildren = @group.people
	@ichildren = @group.items
	
	respond_to do |format|
      format.html { respond_with(@group, @gparents, @gchildren, @pchildren, @ichildren) }
      format.json { respond_with(@relatives) }
    end
  end
  
  # POST /groups
  def create
    
    @user = current_user
    @group = Group.create(params[:group])
    @group.user = @user
	
	@group.save   
    
    respond_to do |format|
      format.html { respond_with(@user, location: restore(default: group_url(@group))) }
      format.js { respond_with(@group) }
    end
    
  end
  
  # GET /groups/:id/edit
  def edit
	@group = Group.find_by_id(params[:id])
	
	@ingroups1 = @group.parent_groups
	if @ingroups1.count > 0
		@outgroups1 = Group.find(:all, :conditions => ['id not in (?) AND id != ?', @ingroups1.map(&:id), @group.id])
	else
		@outgroups1 = Group.find(:all, :conditions => ['id != ?', @group.id])
	end
	
	@ingroups2 = @group.child_groups
	if @ingroups2.count > 0
		@outgroups2 = Group.find(:all, :conditions => ['id not in (?) AND id != ?', @ingroups2.map(&:id), @group.id])
	else
		@outgroups2 = Group.find(:all, :conditions => ['id != ?', @group.id])
	end
  
	respond_with(@group, @ingroups1, @outgroups1, @ingroups2, @outgroups2)
  end
  
  # PUT /groups/:id
  def update
    @user = current_user
	@group = Group.find_by_id(params[:id])
    @group.attributes = params[:group] if @group
    
    @group.save if @group
	
	#remove the selected parent groups
	if params[:ingroups1]
		@ingroups1 = params[:ingroups1]
		@ingroups1.each do |g|
			@connection = Groupgroup.where("parent_group_id = ? AND group_id = ?", g, @group.id).first
			@connection.delete
		end
	end
	
	#remove the selected parent groups
	if params[:outgroups1]
		@outgroups1 = params[:outgroups1]
		@outgroups1.each do |g|
			belongs = Groupgroup.new
			belongs.parent_group_id = g
			belongs.group_id = @group.id
			belongs.save!    
		end 
	end
	
	#remove the selected children groups
	if params[:ingroups2]
		@ingroups2 = params[:ingroups2]
		@ingroups2.each do |g|
			@connection = Groupgroup.where("parent_group_id = ? AND group_id = ?", @group.id, g).first
			@connection.delete
		end
	end
	
	#add the selected children groups
	if params[:outgroups2]
		@outgroups2 = params[:outgroups2]
		@outgroups2.each do |g|
			belongs = Groupgroup.new
			belongs.parent_group_id = @group.id
			belongs.group_id = g
			belongs.save!    
		end 
	end
    
    respond_with(@user, location: restore(default: group_url(@group))) do |format|
    end
  end
  
  # DELETE /groups/:id
  def destroy
	@group = Group.find_by_id(params[:id])
	
	@group.delete
  end

end
