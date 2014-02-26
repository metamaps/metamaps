class SynapsesController < ApplicationController
  include TopicsHelper

  before_filter :require_user, only: [:create, :update, :removefrommap, :destroy]
    
  respond_to :html, :js, :json
  
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
    
    # if the topic exists grab it and return it
    if params[:synapse][:grabSynapse] != "null"
        @synapse = Synapse.find(params[:synapse][:grabSynapse])
    # if not selecting an existing synapse, create it
    else
      @synapse = Synapse.new()
      @synapse.desc = params[:synapse][:desc]
      @synapse.topic1 = Topic.find(params[:synapse][:topic1id])
      @synapse.topic2 = Topic.find(params[:synapse][:topic2id])
      @synapse.permission = "commons"
      @synapse.category = "from-to"
      @synapse.weight = 5
      @synapse.user = @user	
      @synapse.save  
    end     
	
    if params[:synapse][:map]
      @map = Map.find(params[:synapse][:map])
      @map.touch(:updated_at)
      
      @mapping = Mapping.new()
      @mapping.category = "Synapse"
      @mapping.user = @user
      @mapping.map = @map
      @mapping.synapse = @synapse
      @mapping.save
      
      #push add to map to realtime viewers of the map
      @mapping.message 'create',@user.id
      
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
  
  # PUT synapses/:id
  def update
	  @current = current_user
    @synapse = Synapse.find(params[:id]).authorize_to_edit(@current)
    
	  if @synapse
      @permissionBefore = @synapse.permission
      
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
      
      @permissionAfter = @synapse.permission
      
      #push notify to anyone viewing this synapse on a map in realtime (see mapping.rb to understand the 'message' action)
      # if the topic was private and is being switched to PU or CO it is the same as being created for other viewers
      if @permissionBefore == "private" and @permissionAfter != "private"
        @synapse.message 'create',@current.id
      elsif @permissionBefore != "private" and @permissionAfter == "private"
        @synapse.message 'destroy',@current.id
      else 
        @synapse.message 'update',@current.id
      end
    end
	
    respond_to do |format|
      format.js
      format.json { respond_with(@synapse) }
    end
  end

  # POST synapses/:map_id/:synapse_id/removefrommap
  def removefrommap
    @user = current_user
   
    @mapping = Mapping.find_by_synapse_id_and_map_id(params[:synapse_id],params[:map_id])
    
    Map.find(params[:map_id]).touch(:updated_at)
    
    #push notify to anyone viewing same map in realtime (see mapping.rb to understand the 'message' action)
    @mapping.message 'destroy',@user.id
    
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
    
      m.map.touch(:updated_at)
      
      #push notify to anyone viewing same map in realtime (see mapping.rb to understand the 'message' action)
      m.message 'destroy',@current.id
    
      m.delete
    end

    @synapse.delete if @synapse
  end
end
