class MainController < ApplicationController
  include ItemsHelper

  respond_to :html, :js, :json
  
  def home
    @current = current_user
    
	@item = Item.visibleToUser(@current, nil).first
	@alljson = all_as_json(@current).html_safe
	
	respond_to do |format|
      format.html { respond_with(@item) }
      format.json { respond_with(@alljson) }
    end
  end
  
  def allmaps	
	@current = current_user
    @maps = Map.visibleToUser(@current, nil)
	
	respond_to do |format|
      format.html { respond_with(@maps) }
    end
  end

end
