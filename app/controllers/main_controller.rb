class MainController < ApplicationController
  include ItemsHelper

  before_filter :require_user, only: [:invite] 
   
  respond_to :html, :js, :json
  
  def console	
	
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
  
  def invite	
	@user = current_user
	
	respond_to do |format|
      format.html { respond_with(@user) }
    end
  end
  

end
