class MainController < ApplicationController
  include TopicsHelper
  include MapsHelper
  include UsersHelper

  before_filter :require_user, only: [:invite] 
   
  respond_to :html, :js, :json
  
  # home page
  def home
    @maps = Map.visibleToUser(@current, nil).sort! { |a,b| b.created_at <=> a.created_at }
    @maps = @maps.slice(0,5)
    
    respond_with(@maps) 
  end
  
  # /request
  def requestinvite
	  
  end
  
  # /invite
  def invite	
	@user = current_user
	
	respond_to do |format|
      format.html { respond_with(@user) }
    end
  end
  
  ### SEARCHING ###
  
  # get /search/topics?term=SOMETERM
  def searchtopics
    @current = current_user
    
    term = params[:term]
    
    if term && !term.empty? && term.downcase[0..3] != "map:" && term.downcase[0..6] != "mapper:" && term.downcase != "topic:"
      
      #remove "topic:" if appended at beginning
      term = term[6..-1] if term.downcase[0..5] == "topic:"
      
      #check whether there's a filter by metacode as part of the query
      filterByMetacode = false
      Metacode.all.each do |m|
        lOne = m.name.length+1
        lTwo = m.name.length
        
        if term.downcase[0..lTwo] == m.name.downcase + ":"
          term = term[lOne..-1] 
          filterByMetacode = m
        end
      end
      
      if filterByMetacode
        if term == ""
          @topics = []
        else
          search = '%' + term.downcase + '%'
          @topics = Topic.where('LOWER("name") like ? OR LOWER("desc") like ? OR LOWER("link") like ?', search, search, search).
            where('metacode_id = ?', filterByMetacode.id).limit(10).order('"name"').visibleToUser(@current,nil)
        end
      else
        search = '%' + term.downcase + '%'
        @topics = Topic.where('LOWER("name") like ? OR LOWER("desc") like ? OR LOWER("link") like ?', search, search, search).
          limit(10).order('"name"').visibleToUser(@current,nil)
      end
    else
      @topics = []
    end
    render json: autocomplete_array_json(@topics)
    #if params[:topics_by_user_id] != ""
    #  @user = User.find(params[:topics_by_user_id])
    #  @topics = @topics | Topic.visibleToUser(@current, @user)
    #end
    #if params[:topics_by_map_id] != ""
    #  @map = Map.find(params[:topics_by_map_id])
    #  @topics = @topics | @map.topics.delete_if{|topic| not topic.authorize_to_view(@current)}
    #end
    #@topics.sort! { |a,b| a.name.downcase <=> b.name.downcase }
  end
  
  # get /search/maps?term=SOMETERM
  def searchmaps
    @current = current_user
    
    term = params[:term]
    if term && !term.empty? && term.downcase[0..5] != "topic:" && term.downcase[0..6] != "mapper:" && term.downcase != "map:"
    
      #remove "map:" if appended at beginning
      term = term[4..-1] if term.downcase[0..3] == "map:"
      
      search = '%' + term.downcase + '%'
      @maps = Map.where('LOWER("name") like ? OR LOWER("desc") like ?', search, search).
        limit(10).order('"name"').visibleToUser(@current,nil)
    else
      @maps = []
    end
    render json: autocomplete_map_array_json(@maps)
    #if params[:topics_by_user_id] != ""
    #  @user = User.find(params[:topics_by_user_id])
    #  @topics = @topics | Topic.visibleToUser(@current, @user)
    #end
    #if params[:topics_by_map_id] != ""
    #  @map = Map.find(params[:topics_by_map_id])
    #  @topics = @topics | @map.topics.delete_if{|topic| not topic.authorize_to_view(@current)}
    #end
    #@topics.sort! { |a,b| a.name.downcase <=> b.name.downcase }
  end
  
  # get /search/mappers?term=SOMETERM
  def searchmappers
    @current = current_user
    
    term = params[:term]
    if term && !term.empty?  && term.downcase[0..3] != "map:" && term.downcase[0..5] != "topic:" && term.downcase != "mapper:"
    
      #remove "mapper:" if appended at beginning
      term = term[7..-1] if term.downcase[0..6] == "mapper:"
      
      @mappers = User.where('LOWER("name") like ?', '%' + term.downcase + '%').
        limit(10).order('"name"')
    else
      @mappers = []
    end
    render json: autocomplete_user_array_json(@mappers)
    #if params[:topics_by_user_id] != ""
    #  @user = User.find(params[:topics_by_user_id])
    #  @topics = @topics | Topic.visibleToUser(@current, @user)
    #end
    #if params[:topics_by_map_id] != ""
    #  @map = Map.find(params[:topics_by_map_id])
    #  @topics = @topics | @map.topics.delete_if{|topic| not topic.authorize_to_view(@current)}
    #end
    #@topics.sort! { |a,b| a.name.downcase <=> b.name.downcase }
  end 

end
