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
	@gchildren = @group.child_groups
	@pchildren = @group.people
	@ichildren = @group.items
	
	respond_with(@group, @gparents, @gchildren, @pchildren, @ichildren)
  end
  
  # POST /groups
  def create
    
    @user = current_user
    @group = Group.create(params[:group])
    @group.user = @user
	
	@group.save   
    
    respond_to do |format|
      format.html {render :index}
      format.js { respond_with(@group) }
    end
    
  end
  
  # GET /groups/:id/edit
  def edit
	@group = Group.find_by_id(params[:id])
  
	respond_with(@group)
  end
  
  # PUT /groups/:id
  def update
    @user = current_user
	@group = Group.find_by_id(params[:id])
    @group.attributes = params[:group] if @group
    
    @group.save if @group
    
    respond_with(@user, location: restore(default: root_url)) do |format|
    end
  end
  
  # DELETE /groups/:id
  def destroy
	@group = Group.find_by_id(params[:id])
	
	@group.delete
  end

end
