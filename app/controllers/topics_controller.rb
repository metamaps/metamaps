class TopicsController < ApplicationController
  before_filter :require_user, only: [:new, :create, :edit, :update]
    
  respond_to :html, :js, :json
  
  autocomplete :topic, :name, :full => true, :extra_data => [:user_id]
  
  
  # GET topics
  # or GET /users/:user_id/topics
  def index
    @current = current_user
    
    if params[:user_id]
      @user = User.find(params[:user_id])
  	  @topics = Topic.order("name ASC").visibleToUser(@current, @user)
    elsif      
      @topics = Topic.order("name ASC").visibleToUser(@current, nil)
    end
     
    respond_with(@user,@topics)
  end
  
  # Get topics/new
  def new
  	@topic = Topic.new
    @user = current_user
    
    respond_with(@topic)
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
    @mapping = Mapping.new()
    if params[:topic][:map]
      @mapping.category = "Topic"
      @mapping.user = @user
      @mapping.map = Map.find(params[:topic][:map])
      @mapping.topic = @topic
      @mapping.xloc = params[:topic][:x]
      @mapping.yloc = params[:topic][:y]
      @mapping.save
    end
    
    respond_to do |format|
      format.html { respond_with(@user, location: topic_url(@topic)) }
      format.js { respond_with(@topic, @mapping, @synapse, @position) }
    end
  end
  
  # GET topics/:id/edit
  def edit
	  @current = current_user
	  @topic = Topic.find(params[:id]).authorize_to_edit(@current)
	
	  if not @topic
		  redirect_to root_url and return
	  end
  
	  respond_with(@topic)
  end
  
  # PUT topics/:id
  def update
	  @current = current_user
	  @topic = Topic.find(params[:id]).authorize_to_edit(@current)
    
	  if @topic 
        if params[:topic]
          @topic.name = params[:topic][:name] if params[:topic][:name]
		  @topic.desc = params[:topic][:desc] if params[:topic][:desc]
		  @topic.link = params[:topic][:link] if params[:topic][:link]
		  @topic.permission = params[:topic][:permission] if params[:topic][:permission]
          @topic.metacode = Metacode.find_by_name(params[:topic][:metacode]) if params[:topic][:metacode]
        end
	    @topic.save
      end

      respond_with @topic
	
#    respond_with(@user, location: topic_url(@topic)) do |format|
#    end
  end
  
  # GET mappings/:map_id/:topic_id/removefrommap
  def removefrommap
	  @current = current_user
	  @mapping = Mapping.find_by_topic_id_and_map_id(params[:topic_id],params[:map_id])
	  
    @map = Map.find(params[:map_id])
    @topic = Topic.find(params[:topic_id])
    @mappings = @map.mappings.select{|m| 
      if m.category == "Synapse"
        m.synapse.topic1 == @topic || m.synapse.topic2 == @topic 
      else
        false
      end
    }
    @mappings.each do |m|
      m.delete
    end
    
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
        synapse.delete
      end
    
      @mappings.each do |mapping| 
        mapping.delete
      end
    
      @topic.delete
    end
      
	  respond_to do |format|
      format.js
    end
  end
end
