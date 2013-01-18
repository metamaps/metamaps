class MainController < ApplicationController
  include TopicsHelper

  before_filter :require_user, only: [:invite] 
   
  respond_to :html, :js, :json
  
  def home
    @topics = Topic.visibleToUser(@current, nil).sort! { |a,b| b.created_at <=> a.created_at }
    @topics = @topics.slice(0,3)
    @synapses = Synapse.visibleToUser(@current, nil).sort! { |a,b| b.created_at <=> a.created_at }
    @synapses = @synapses.slice(0,3)
    @maps = Map.visibleToUser(@current, nil).sort! { |a,b| b.created_at <=> a.created_at }
    @maps = @maps.slice(0,3)
    
    respond_with(@topics, @synapses, @maps) 
  end
  
  def console	
	
  end
  
  def search
    @current = current_user
    @topics = Array.new()
    @synapses = Array.new()
    if params[:topics_by_name] != ""
      like_keyword = "%"+params[:topics_by_name]+"%"    
      @topics = Topic.where("name LIKE ?", like_keyword)
    end
    if params[:topics_by_user_id] != ""
      @user = User.find(params[:topics_by_user_id])
      @topics = @topics | Topic.visibleToUser(@current, @user)
    end
    if params[:topics_by_map_id] != ""
      @map = Map.find(params[:topics_by_map_id])
      @topics = @topics | @map.topics.delete_if{|topic| not topic.authorize_to_view(@current)}
    end
    
    @topics.each do |t|
      t.synapses.each do |s|
        @synapses = @synapses.push(s) if not @synapses.include? s 
      end
    end
    
    @topics.sort! { |a,b| a.name.downcase <=> b.name.downcase }
    
    respond_to do |format|
      format.js { respond_with(@topics,@synapses) }
    end
  end
  
  def invite	
	@user = current_user
	
	respond_to do |format|
      format.html { respond_with(@user) }
    end
  end
  

end
