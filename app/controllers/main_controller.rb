class MainController < ApplicationController

  respond_to :html, :js, :json
  
  def home
    @current_user = current_user
	
	@all = Group.all + Person.all + Item.all
	
    respond_with(@all)
  end

end
