class UsersController < ApplicationController

  before_filter :require_user, only: [:edit, :update]
    
  respond_to :html, :json
  
  autocomplete :user, :name, :full => true
 
  
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
