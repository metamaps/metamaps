class MainController < ApplicationController
  include ItemsHelper

  before_filter :require_user, only: [:invite] 
   
  respond_to :html, :js, :json
  
  #homepage pick a random map and show it
  def console	
	
    @current = current_user
    
    if authenticated? 
	    
    else 
      @maps = Map.visibleToUser(@current, nil)
      @map = @maps.sample
    
      @mapjson = @map.self_as_json(@current).html_safe if @map
    
      respond_to do |format|
        format.html { respond_with(@map) }
        format.json { respond_with(@mapjson) }
      end
    end
  end
  
  def search
    @current = current_user
    @items = Array.new()
    if params[:topics_by_user_id] != ""
      @user = User.find(params[:topics_by_user_id])
      @items = Item.visibleToUser(@current, @user)
    elsif params[:topics_by_map_id] != ""
      @map = Map.find(params[:topics_by_map_id])
      @items = @map.items.delete_if{|item| not item.authorize_to_view(@current)}
    end
    respond_to do |format|
      format.js { respond_with(@items) }
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
  
  def invite	
	@user = current_user
	
	respond_to do |format|
      format.html { respond_with(@user) }
    end
  end
  

end
