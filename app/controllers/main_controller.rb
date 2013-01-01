class MainController < ApplicationController
  include TopicsHelper

  before_filter :require_user, only: [:invite] 
   
  respond_to :html, :js, :json
  
  def console	
	
  end
  
  def search
    @current = current_user
    @topics = Array.new()
    if params[:topics_by_user_id] != ""
      @user = User.find(params[:topics_by_user_id])
      @topics = Topic.visibleToUser(@current, @user)
    elsif params[:topics_by_map_id] != ""
      @map = Map.find(params[:topics_by_map_id])
      @topics = @map.topics.delete_if{|topic| not topic.authorize_to_view(@current)}
    end
    respond_to do |format|
      format.js { respond_with(@topics) }
    end
  end
  
  def invite	
	@user = current_user
	
	respond_to do |format|
      format.html { respond_with(@user) }
    end
  end
  

end
