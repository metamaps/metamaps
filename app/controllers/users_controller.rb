class UsersController < ApplicationController

  before_filter :require_user, only: [:edit, :update]
    
  respond_to :html, :json 
  
  # GET /user/edit
  def edit
    @user = current_user
    
    respond_with(@user)  
  end
  
  # PUT /user
  def update
    @user = current_user
    @user.attributes = params[:user]
    
    @user.save

    sign_in(@user, :bypass => true)
       
    respond_with(@user, location: session[:previous_url]) do |format|
    end
  end
    
  # PUT /user/updatemetacodes
  def updatemetacodes
    @user = current_user
    
    @m = params[:metacodes][:value]
    @user.settings.metacodes=@m.split(',')
    
    @user.save

    respond_to do |format|
      format.json { render json: @user }
    end
  end

end
