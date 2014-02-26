class TopicsController < ApplicationController
  include TopicsHelper

  before_filter :require_user, only: [:create, :update, :removefrommap, :destroy]
    
  respond_to :html, :js, :json
    
  # GET /topics/autocomplete_topic
  def autocomplete_topic
    @current = current_user
    term = params[:term]
    if term && !term.empty?
    	# !connor term here needs to have .downcase
      @topics = Topic.where('LOWER("name") like ?', term.downcase + '%').order('"name"')
      
      #read this next line as 'delete a topic if its private and you're either 1. logged out or 2. logged in but not the topic creator
      @topics.delete_if {|t| t.permission == "private" && (!authenticated? || (authenticated? && @current.id != t.user_id)) }
    else
      @topics = []
    end
    render json: autocomplete_array_json(@topics)
  end
  
  # GET topics/:id
  def show
    @current = current_user
    @topic = Topic.find(params[:id]).authorize_to_show(@current)
	
    if @topic
	  @relatives = @topic.network_as_json(@current).html_safe
    else
	  redirect_to root_url and return
    end
	
    respond_to do |format|
      format.html { respond_with(@topic, @user) }
      format.json { respond_with(@relatives) }
    end
  end
  
  # GET topics/:id/json
  def json
    @current = current_user
    @topic = Topic.find(params[:id]).authorize_to_show(@current)
	
    if not @topic
	    redirect_to root_url and return
    end
	
    respond_to do |format|
      format.json { render :json => @topic.self_as_json }
    end
  end

  # POST topics
  def create
    
    @user = current_user
    
    # if the topic exists grab it and return it
    if params[:topic][:grabTopic] != "null"
        @topic = Topic.find(params[:topic][:grabTopic])
    # if the topic doesn't exist yet, create it
    else
      @topic = Topic.new()
      @topic.name = params[:topic][:name]
      @topic.desc = ""
      @topic.link = ""
      @topic.permission = 'commons'
      @topic.metacode = Metacode.find_by_name(params[:topic][:metacode])
      @topic.user = @user
      
      #if being created on a map, set topic by default to whatever permissions the map is
      if params[:topic][:map]
        @map = Map.find(params[:topic][:map])
        @topic.permission = @map.permission
      end 

      @topic.save
    end

    # pass on to the topic create js whether it's being created with a synapse
    @synapse = "false"
    if params[:topic][:addSynapse] == "true"
      @synapse = "true" 
    end

    # also create an object to return the position to the canvas
    @position = Hash.new()
    @position['x'] = params[:topic][:x]
    @position['y'] = params[:topic][:y]
    
    # set this for the case where the topic is being created on a map.
    @mapping = nil
    if params[:topic][:map]
      @map = Map.find(params[:topic][:map])
      @map.touch(:updated_at)
      
      @mapping = Mapping.new()
      @mapping.category = "Topic"
      @mapping.user = @user
      @mapping.map = @map
      @mapping.topic = @topic
      @mapping.xloc = params[:topic][:x]
      @mapping.yloc = params[:topic][:y]
      @mapping.save
      
      #push add to map to realtime viewers of the map
      @mapping.message 'create',@user.id
    end
    
    respond_to do |format|
      format.html { respond_with(@user, location: topic_url(@topic)) }
      format.js { respond_with(@topic, @mapping, @synapse, @position) }
    end
  end
  
  # PUT topics/:id
  def update
	  @current = current_user
	  @topic = Topic.find(params[:id]).authorize_to_edit(@current)
    
	  if @topic 
        if params[:topic]
          @permissionBefore = @topic.permission
        
          @topic.name = params[:topic][:name] if params[:topic][:name]
		      @topic.desc = params[:topic][:desc] if params[:topic][:desc]
		      @topic.link = params[:topic][:link] if params[:topic][:link]
		      @topic.permission = params[:topic][:permission] if params[:topic][:permission]
          @topic.metacode = Metacode.find_by_name(params[:topic][:metacode]) if params[:topic][:metacode]
          
          @permissionAfter = @topic.permission
        end
	    @topic.save
      
      #push notify to anyone viewing this topic on a map in realtime (see mapping.rb to understand the 'message' action)
      # if the topic was private and is being switched to PU or CO it is the same as being created for other viewers
      if @permissionBefore == "private" and @permissionAfter != "private"
        @topic.message 'create',@current.id
      elsif @permissionBefore != "private" and @permissionAfter == "private"
        @topic.message 'destroy',@current.id
      else 
        @topic.message 'update',@current.id
      end
    end
    
    respond_to do |format|
      format.js { render :json => @topic.self_as_json }
      format.json { render :json => @topic.self_as_json }
    end
  end
  
  # POST topics/:map_id/:topic_id/removefrommap
  def removefrommap
	  @current = current_user
	  @mapping = Mapping.find_by_topic_id_and_map_id(params[:topic_id],params[:map_id])
	  
    @map = Map.find(params[:map_id])
    @map.touch(:updated_at)
    @topic = Topic.find(params[:topic_id])
    @mappings = @map.mappings.select{|m| 
      if m.synapse != nil
        m.synapse.topic1 == @topic || m.synapse.topic2 == @topic 
      else
        false
      end
    }
    @mappings.each do |m|
    
      #push notify to anyone viewing same map in realtime (see mapping.rb to understand the 'message' action)
      m.message 'destroy',@current.id
      
      m.delete
    end
    
    
    #push notify to anyone viewing same map in realtime (see mapping.rb to understand the 'message' action)
    #@mapping.message 'destroy',@current.id
    
    @mapping.delete
      
	  respond_to do |format|
      format.js
    end
  end
  
  # DELETE topics/:id
  def destroy
	  @current = current_user
	  @topic = Topic.find(params[:id]).authorize_to_edit(@current)
	  
    if @topic 
      @synapses = @topic.synapses
      @mappings = @topic.mappings
    
      @synapses.each do |synapse| 
        synapse.mappings.each do |m|
        
          @map = m.map
          @map.touch(:updated_at)
        
          #push notify to anyone viewing same map in realtime (see mapping.rb to understand the 'message' action)
          m.message 'destroy',@current.id
        
          m.delete
        end
        
        synapse.delete
      end
    
      @mappings.each do |mapping| 
      
        @map = mapping.map
        @map.touch(:updated_at)
        
        #push notify to anyone viewing a map with this topic in realtime (see mapping.rb to understand the 'message' action)
        mapping.message 'destroy',@current.id
      
        mapping.delete
      end
    
      @topic.delete
    end
      
	  respond_to do |format|
      format.js
    end
  end
end
