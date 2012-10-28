class MainController < ApplicationController
  include ItemsHelper

  respond_to :html, :js, :json
  
  #homepage pick a random map and show it
  def samplemap	
	@current = current_user
    @maps = Map.visibleToUser(@current, nil)
	@map = @maps.sample
	
	@mapjson = @map.self_as_json(@current).html_safe
	
	respond_to do |format|
      format.html { respond_with(@map, @user) }
      format.json { respond_with(@mapjson) }
    end
  end
  
  def metamap
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
