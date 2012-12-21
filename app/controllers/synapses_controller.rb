class SynapsesController < ApplicationController
  include ItemsHelper

  before_filter :require_user, only: [:new, :create, :edit, :update]
    
  respond_to :html, :js, :json
  
  autocomplete :synapse, :desc, :full => true
  
  # GET synapses
  # or GET users/:user_id/synapses
  def index
    @current = current_user
    
    if params[:user_id]
      @user = User.find(params[:user_id])
  	  @synapses = Synapse.visibleToUser(@current, @user)
    elsif
      @synapses = Synapse.visibleToUser(@current, nil)
    end
	  
	  @synapsesjson = synapses_as_json(@current, @synapses).html_safe

    respond_to do |format|
      format.html 
      format.json { respond_with(@synapsesjson) }
    end
  end
  
  # Get synapses/new
  def new
  	@synapse = Synapse.new
    @user = current_user
    
    respond_with(@synapse)
  end
  
  # GET synapses/:id
  def show
  	@current = current_user
    @synapse = Synapse.find(params[:id]).authorize_to_show(@current)
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
  
  # POST synapses
  def create
	
    @user = current_user
    @synapse = Synapse.new()
    @synapse.desc = params[:synapse][:desc]
    @synapse.item1 = Item.find(params[:synapse][:item1id])
    @synapse.item2 = Item.find(params[:synapse][:item2id])
    @synapse.permission = "commons"
    @synapse.category = "from-to"
    @synapse.weight = 5
    @synapse.user = @user	
    @synapse.save   
	
	  if params[:synapse][:map]
		  @mapping = Mapping.new()
		  @mapping.category = "Synapse"
		  @mapping.user = @user
		  @mapping.map = Map.find(params[:synapse][:map])
		  @mapping.synapse = @synapse
		  @mapping.save
	  end
    
    respond_to do |format|
      format.html { respond_with(@user, location: synapse_url(@synapse)) }
      format.js { respond_with(@synapse) }
    end
    
  end
  
  # GET synapses/:id/edit
  def edit
	  @current = current_user
    @synapse = Synapse.find(params[:id]).authorize_to_edit(@current)
	
	  if @synapse 
		  @items = Item.visibleToUser(@current, nil)
	  elsif not @synapse
		  redirect_to root_url and return
	  end
  
	  respond_with(@synapse, @items)
  end
  
  # PUT synapses/:id
  def update
	  @current = current_user
    @synapse = Synapse.find(params[:id]).authorize_to_edit(@current)
    
	  if @synapse 
		  @synapse.desc = params[:synapse][:desc]
		  @synapse.category = params[:synapse][:category]
		  @synapse.item1 = Item.find(params[:node1_id][:node1])
		  @synapse.item2 = Item.find(params[:node2_id][:node2])
	    @synapse.permission = params[:synapse][:permission]
		  @synapse.save
    end
	
    respond_with(@user, location: synapse_url(@synapse)) do |format|
    end
  end
  
  # DELETE synapses/:id
  def destroy
	  @current = current_user
	  @synapse = Synapse.find(params[:id]).authorize_to_edit(@current)
	
	  @synapse.delete if @synapse
  end
end
