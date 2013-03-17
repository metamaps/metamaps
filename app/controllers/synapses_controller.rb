class SynapsesController < ApplicationController
  include TopicsHelper

  before_filter :require_user, only: [:new, :create, :edit, :update, :removefrommap, :destroy]
    
  respond_to :html, :js, :json
  
  def autocomplete_synapse_desc
    term = params[:term]
    if term && !term.empty?
      items = Synapse.select('DISTINCT "desc"').
        where('LOWER("desc") like ?', term.downcase + '%').
        limit(10).order('"desc"')
    else
      items = {}
    end
    render :json => json_for_autocomplete(items, :desc)
  end
  
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
	  @topic1 = @synapse.topic1.authorize_to_show(@current)
	  @topic2 = @synapse.topic2.authorize_to_show(@current)
	
	  if @synapse && @topic1 && @topic2
		  @synapsejson = @synapse.selfplusnodes_as_json.html_safe
	  else
		  redirect_to root_url and return
	  end
	
	  respond_to do |format|
      format.html
      format.json { respond_with(@synapsejson) }
    end
  end
  
  # GET synapses/:id/json
  def json
    @current = current_user
    @synapse = Synapse.find(params[:id]).authorize_to_show(@current)
	
    if not @synapse
	    redirect_to root_url and return
    end
	
    respond_to do |format|
      format.json { render :json => @synapse.selfplusnodes_as_json }
    end
  end
  
  # POST synapses
  def create
    @user = current_user
    @synapse = Synapse.new()
    @synapse.desc = params[:synapse][:desc]
    @synapse.topic1 = Topic.find(params[:synapse][:topic1id])
    @synapse.topic2 = Topic.find(params[:synapse][:topic2id])
    @synapse.permission = "commons"
    @synapse.category = "from-to"
    @synapse.weight = 5
    @synapse.user = @user	
    @synapse.save   
	
    if params[:synapse][:map]
      @map = Map.find(params[:synapse][:map])
      @mapping = Mapping.new()
      @mapping.category = "Synapse"
      @mapping.user = @user
      @mapping.map = @map
      @mapping.synapse = @synapse
      @mapping.save
      
      # set the permission of the synapse to whatever the permission of the 
      #map is
      @synapse.permission = @map.permission
      @synapse.save
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
      @topics = Topic.visibleToUser(@current, nil)
    elsif not @synapse
      redirect_to root_url and return
    end
  
	  respond_with(@synapse, @topics)
  end
  
  # PUT synapses/:id
  def update
	  @current = current_user
    @synapse = Synapse.find(params[:id]).authorize_to_edit(@current)
    
	  if @synapse
      if params[:synapse]
        @synapse.desc = params[:synapse][:desc] if params[:synapse][:desc]
	      @synapse.category = params[:synapse][:category] if params[:synapse][:category]
	      @synapse.permission = params[:synapse][:permission] if params[:synapse][:permission]
      end
      if params[:node1_id] and params[:node1_id][:node1]
	      @synapse.topic1 = Topic.find(params[:node1_id][:node1])
      end
      if params[:node2_id] and params[:node2_id][:node2]
	      @synapse.topic2 = Topic.find(params[:node2_id][:node2])
      end
	    @synapse.save
    end
	
    respond_to do |format|
      format.js
      format.json { respond_with(@synapse) }
    end
  end

  # POST mappings/:map_id/:synapse_id/removefrommap
  def removefrommap
    @mapping = Mapping.find_by_synapse_id_and_map_id(params[:synapse_id],params[:map_id])
    @mapping.delete

    respond_to do |format|
      format.js
    end
  end
  
  # DELETE synapses/:id
  def destroy
    @current = current_user
    @synapse = Synapse.find(params[:id]).authorize_to_edit(@current)

    @synapse.mappings.each do |m|
      m.delete
    end

    @synapse.delete if @synapse
  end
end
