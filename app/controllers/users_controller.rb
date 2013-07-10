class UsersController < ApplicationController

  before_filter :require_no_user, only: [:new, :create]
  before_filter :require_user, only: [:edit, :update]
    
  respond_to :html, :json
  
  autocomplete :user, :name, :full => true
  
  # GET /user/new
  def new
  
    flash[:notice] = "Account creation is temporarily disabled."
    redirect_to root_url
    return
  
    @user = User.new
    
    respond_with(@user)
  end
  
  # GET /user/edit
  def edit
    @user = current_user
    
    respond_with(@user)  
  end
  
  # GET /user/:id
  def show
    @user = User.find(params[:id])
    @topics = Topic.visibleToUser(@current, @user).sort! { |a,b| b.created_at <=> a.created_at }
    @topics = @topics.slice(0,3)
    @synapses = Synapse.visibleToUser(@current, @user).sort! { |a,b| b.created_at <=> a.created_at }
    @synapses = @synapses.slice(0,3)
    @maps = Map.visibleToUser(@current, @user).sort! { |a,b| b.created_at <=> a.created_at }
    @maps = @maps.slice(0,3)
    
    respond_with(@user, @topics, @synapses, @maps) 
  end
  
  # POST /user
  def create
  
    # update this code
  
    @session = Session.create(params[:user])
    
    redirect_to(root_url) and return if @session.valid?
    
    @user = User.create(params[:user])
	
	  #generate a random 8 letter/digit code that they can use to invite people
	  @user.code = rand(36**8).to_s(36)	
    @user.save
	
	  # direct them straight to the metamaps manual topic 'Click Me'
    @topic = Topic.exists?(260)
        
    if @topic
      respond_with(@user, location: topic_url(260)) do |format|
      end
    else
      respond_with(@user, location: root_url) do |format|
      end
    end
  end
  
  # PUT /user
  def update
    @user = current_user
    @user.attributes = params[:user]
    
    @m = params[:metacodes][:value]
    @user.settings.metacodes=@m.split(',')
    
    @user.save
    
    respond_with(@user, location: user_url(@user)) do |format|
    end
  end

end
