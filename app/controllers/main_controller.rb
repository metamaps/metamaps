class MainController < ApplicationController

  before_filter :require_user, only: [:userobjects]
  respond_to :html, :js, :json
  
  def home
    @current_user = current_user
	
	@all = Group.all + Person.all + Item.all
	
    respond_with(@all)
  end
  
  def userobjects
    @user = current_user
	
	@all = @user.groups + @user.people + @user.items
	
    respond_with(@all)
  end

end
