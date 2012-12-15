class SynapsesController < ApplicationController
  include ItemsHelper

  before_filter :require_user, only: [:new, :create, :edit, :update]
    
  respond_to :html, :js, :json
  
  # GET users/:user_id/synapses
  def index
    @user = User.find(params[:user_id])
  	
	@current = current_user
	@synapses = Synapse.visibleToUser(@current, @user)
	@synapsesjson = synapses_as_json(@current, @synapses).html_safe

    respond_to do |format|
      format.html 
      format.json { respond_with(@synapsesjson) }
    end
  end
  
  # Get users/:user_id/synapses/new
  def new
  	@synapse = Synapse.new
    @user = current_user
    
    respond_with(@synapse)
  end
  
  # GET users/:user_id/synapses/:id
  def show
  	@user = User.find(params[:user_id])
  	
	@current = current_user
	@synapse = @user.synapses.find(params[:id]).authorize_to_show(@current)
	@item1 = @synapse.item1.authorize_to_show(@current)
	@item2 = @synapse.item2.authorize_to_show(@current)
	
	if @synapse && @item1 && @item2
		@synapsejson = @synapse.selfplusnodes_as_json.html_safe
	else
		redirect_to root_url and return
	end
	
	respond_to do |format|
      format.html
      format.json { respond_with(@synapsejson) }
    end
  end
  
  # POST users/:user_id/synapses
  def create
	
    @user = current_user
	@synapse = Synapse.new()
	@synapse.desc = params[:synapse][:desc]
	@synapse.category = params[:synapse][:category]
	@synapse.item1 = Item.find(params[:node1_id])
	@synapse.item2 = Item.find(params[:node2_id])
	@synapse.permission = params[:synapse][:permission]
  @synapse.user = @user	
	@synapse.save   
	
  @mapping1 = Mapping.new()
  @mapping2 = Mapping.new()
	if params[:synapse][:map]
		@mapping = Mapping.new()
		@mapping.category = "Synapse"
		@mapping.user = @user
		@mapping.map = Map.find(params[:synapse][:map])
		@mapping.synapse = @synapse
		@mapping.save
		
		if not Map.find(params[:synapse][:map]).items.include?(@synapse.item1)
			@mapping1.category = "Item"
			@mapping1.user = @user
			@mapping1.map = Map.find(params[:synapse][:map])
			@mapping1.item = @synapse.item1
			@mapping1.save
		end
		if not Map.find(params[:synapse][:map]).items.include?(@synapse.item2)
			@mapping2.category = "Item"
			@mapping2.user = @user
			@mapping2.map = Map.find(params[:synapse][:map])
			@mapping2.item = @synapse.item2
			@mapping2.save
		end
	end
    
    respond_to do |format|
      format.html { respond_with(@user, location: user_synapse_url(@user, @synapse)) }
      format.js { respond_with(@synapse, @mapping1, @mapping2) }
    end
    
  end
  
  # GET users/:user_id/synapses/:id/edit
  def edit
	@user = User.find(params[:user_id])
  	
	@current = current_user
	@synapse = @user.synapses.find(params[:id]).authorize_to_edit(@current)
	
	if @synapse 
		@items = Item.visibleToUser(@current, nil)
	elsif not @synapse
		redirect_to root_url and return
	end
  
	respond_with(@synapse, @items)
  end
  
  # PUT users/:user_id/synapses/:id
  def update
	@user = User.find(params[:user_id])
  	
	@synapse = @user.synapses.find(params[:id])
    
	if @synapse 
		@synapse.desc = params[:synapse][:desc]
		@synapse.category = params[:synapse][:category]
		@synapse.item1 = Item.find(params[:node1_id][:node1])
		@synapse.item2 = Item.find(params[:node2_id][:node2])
	    @synapse.permission = params[:synapse][:permission]
		@synapse.save
    end
	
    respond_with(@user, location: user_synapse_url(@user, @synapse)) do |format|
    end
	
  end
  
  # DELETE users/:user_id/synapses/:id
  def destroy
	@user = User.find(params[:user_id])
  	
	@synapse = @user.synapses.find(params[:id])
	
	@synapse.delete
  end

end
