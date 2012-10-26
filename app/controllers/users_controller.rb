class UsersController < ApplicationController

  before_filter :require_no_user, only: [:new, :create]
  before_filter :require_user, only: [:edit, :update]
    
  respond_to :html, :json
  
  # GET /user/new
  def new
    @user = User.new
    
    respond_with(@user)
  end
  
  # GET /user/edit
  def edit
    @user = current_user
    
    respond_with(@user)  
  end
  
  # GET /user
  def show
    @user = current_user
    
    respond_with(@user) 
  end
  
  # POST /user
  def create
    @session = Session.create(params[:user])
    
    redirect_to(root_url) and return if @session.valid?
    
    @user = User.create(params[:user])
	
    @user.save
        
    respond_with(@user, location: root_url) do |format|
    end
  end
  
  # PUT /user
  def update
    @user = current_user
    @user.attributes = params[:user]
    
    @user.save
    
    respond_with(@user, location: user_url(@user)) do |format|
    end
  end

end
