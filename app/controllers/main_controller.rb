class MainController < ApplicationController

  before_filter :require_user, only: [:userobjects]
  respond_to :html, :js, :json
  
  def home
    @current_user = current_user
	
	@item = Item.all.first
	
	@alljson = @item.all_as_json.html_safe
	
	respond_to do |format|
      format.html { respond_with(@item) }
      format.json { respond_with(@alljson) }
    end
  end
  
  def userobjects
    @user = current_user
	
	@all = @user.items
	
    respond_with(@all)
  end
  
  def usersynapses
    @user = current_user
	
	@all = @user.synapses
	
    respond_with(@all)
  end

end
