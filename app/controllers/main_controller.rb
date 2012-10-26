class MainController < ApplicationController
  include ItemsHelper

  respond_to :html, :js, :json
  
  def home
    @current_user = current_user
	
	@item = Item.all.first
	
    if @item
	  @alljson = @item.all_as_json.html_safe
    end
	
	respond_to do |format|
      format.html { respond_with(@item) }
      format.json { respond_with(@alljson) }
    end
  end
  
  def allmaps
    @current_user = current_user
	
	@maps = Map.all
	
	respond_to do |format|
      format.html { respond_with(@maps) }
    end
  end

end
