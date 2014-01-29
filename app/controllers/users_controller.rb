class UsersController < ApplicationController

  before_filter :require_user, only: [:edit, :update]
    
  respond_to :html, :json
  
  autocomplete :user, :name, :full => true
 
  
  # GET /user/edit
  def edit
    @user = current_user
    
    respond_with(@user)  
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
