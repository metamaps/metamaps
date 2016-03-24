class MainController < ApplicationController
  include TopicsHelper
  include MapsHelper
  include UsersHelper
  include SynapsesHelper
   
  respond_to :html, :json
  
  # home page
  def home
    @current = current_user
   
    respond_to do |format|
        format.html { 
          if authenticated?
            @maps = Map.where("maps.permission != ?", "private").order("updated_at DESC").page(1).per(20)
            respond_with(@maps, @current) 
          else 
            respond_with(@current) 
          end
        }
    end
  end
  
  ### SEARCHING ###
  
  # get /search/topics?term=SOMETERM
  def searchtopics
    term = params[:term]
    user = params[:user] ? params[:user] : false
    
    if term && !term.empty? && term.downcase[0..3] != "map:" && term.downcase[0..6] != "mapper:" && term.downcase != "topic:"
      
      #remove "topic:" if appended at beginning
      term = term[6..-1] if term.downcase[0..5] == "topic:"
      
      #if desc: search desc instead
      desc = false
      if term.downcase[0..4] == "desc:"
        term = term[5..-1] 
        desc = true
      end
      
      #if link: search link instead
      link = false
      if term.downcase[0..4] == "link:"
        term = term[5..-1] 
        link = true
      end
      
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
          search = term.downcase + '%'
          
          if user
            @topics = Set.new(Topic.where('LOWER("name") like ?', search).where('metacode_id = ? AND user_id = ?',  filterByMetacode.id, user).order('"name"'))
            @topics2 = Set.new(Topic.where('LOWER("name") like ?', '%' + search).where('metacode_id = ? AND user_id = ?',  filterByMetacode.id, user).order('"name"'))
            @topics3 = Set.new(Topic.where('LOWER("desc") like ?', '%' + search).where('metacode_id = ? AND user_id = ?',  filterByMetacode.id, user).order('"name"'))
            @topics4 = Set.new(Topic.where('LOWER("link") like ?', '%' + search).where('metacode_id = ? AND user_id = ?',  filterByMetacode.id, user).order('"name"'))
          else
            @topics = Set.new(Topic.where('LOWER("name") like ?', search).where('metacode_id = ?',  filterByMetacode.id).order('"name"'))
            @topics2 = Set.new(Topic.where('LOWER("name") like ?', '%' + search).where('metacode_id = ?',  filterByMetacode.id).order('"name"'))
            @topics3 = Set.new(Topic.where('LOWER("desc") like ?', '%' + search).where('metacode_id = ?',  filterByMetacode.id).order('"name"'))
            @topics4 = Set.new(Topic.where('LOWER("link") like ?', '%' + search).where('metacode_id = ?',  filterByMetacode.id).order('"name"'))
          end

          #get unique elements only through the magic of Sets
          @topics = (@topics + @topics2 + @topics3 + @topics4).to_a
        end
      elsif desc
        search = '%' + term.downcase + '%'
        if !user
          @topics = Topic.where('LOWER("desc") like ?', search).order('"name"')
        elsif user
          @topics = Topic.where('LOWER("desc") like ?', search).where('user_id = ?', user).order('"name"')
        end
      elsif link
        search = '%' + term.downcase + '%'
        if !user
          @topics = Topic.where('LOWER("link") like ?', search).order('"name"')
        elsif user
          @topics = Topic.where('LOWER("link") like ?', search).where('user_id = ?', user).order('"name"')
        end
      else #regular case, just search the name
        search = term.downcase + '%'
        if !user
          @topics = Topic.where('LOWER("name") like ?', search).order('"name"')
          @topics2 = Topic.where('LOWER("name") like ?', '%' + search).order('"name"')
          @topics3 = Topic.where('LOWER("desc") like ?', '%' + search).order('"name"')
          @topics4 = Topic.where('LOWER("link") like ?', '%' + search).order('"name"')
          @topics = @topics + (@topics2 - @topics)
          @topics = @topics + (@topics3 - @topics)
          @topics = @topics + (@topics4 - @topics)
        elsif user
          @topics = Topic.where('LOWER("name") like ?', search).where('user_id = ?', user).order('"name"')
          @topics2 = Topic.where('LOWER("name") like ?', '%' + search).where('user_id = ?', user).order('"name"')
          @topics3 = Topic.where('LOWER("desc") like ?', '%' + search).where('user_id = ?', user).order('"name"')
          @topics4 = Topic.where('LOWER("link") like ?', '%' + search).where('user_id = ?', user).order('"name"')
          @topics = @topics + (@topics2 - @topics)
          @topics = @topics + (@topics3 - @topics)
          @topics = @topics + (@topics4 - @topics)
        end
      end
    else
      @topics = []
    end
    
    #read this next line as 'delete a topic if its private and you're either 1. logged out or 2. logged in but not the topic creator
    @topics.to_a.delete_if {|t| t.permission == "private" && (!authenticated? || (authenticated? && current_user.id != t.user_id)) }
    
    render json: autocomplete_array_json(@topics)
  end
  
  # get /search/maps?term=SOMETERM
  def searchmaps
    term = params[:term]
    user = params[:user] ? params[:user] : nil
    
    if term && !term.empty? && term.downcase[0..5] != "topic:" && term.downcase[0..6] != "mapper:" && term.downcase != "map:"
    
      #remove "map:" if appended at beginning
      term = term[4..-1] if term.downcase[0..3] == "map:"
      
      #if desc: search desc instead
      desc = false
      if term.downcase[0..4] == "desc:"
        term = term[5..-1] 
        desc = true
      end
      search = '%' + term.downcase + '%'
      query = desc ?  'LOWER("desc") like ?' : 'LOWER("name") like ?'
      if !user
      	# !connor why is the limit 5 done here and not above? also, why not limit after sorting alphabetically?
        @maps = Map.where(query, search).limit(5).order('"name"')
      elsif user
        @maps = Map.where(query, search).where('user_id = ?', user).order('"name"')
      end
    else
      @maps = []
    end
    
    #read this next line as 'delete a map if its private and you're either 1. logged out or 2. logged in but not the map creator
    @maps.to_a.delete_if {|m| m.permission == "private" && (!authenticated? || (authenticated? && current_user.id != m.user_id)) }
    
    render json: autocomplete_map_array_json(@maps)
  end
  
  # get /search/mappers?term=SOMETERM
  def searchmappers
    term = params[:term]
    if term && !term.empty?  && term.downcase[0..3] != "map:" && term.downcase[0..5] != "topic:" && term.downcase != "mapper:"
    
      #remove "mapper:" if appended at beginning
      term = term[7..-1] if term.downcase[0..6] == "mapper:"
      @mappers = User.where('LOWER("name") like ?', term.downcase + '%').order('"name"')
    else
      @mappers = []
    end
    render json: autocomplete_user_array_json(@mappers)
  end 
  
  # get /search/synapses?term=SOMETERM OR
  # get /search/synapses?topic1id=SOMEID&topic2id=SOMEID
  def searchsynapses
    term = params[:term]
    topic1id = params[:topic1id]
    topic2id = params[:topic2id]

    if term && !term.empty?
      @synapses = Synapse.where('LOWER("desc") like ?', '%' + term.downcase + '%').order('"desc"')

      # remove any duplicate synapse types that just differ by 
      # leading or trailing whitespaces
      collectedDesc = []
      @synapses.to_a.uniq(&:desc).delete_if {|s|
        desc = s.desc == nil || s.desc == "" ? "" : s.desc.strip
        if collectedDesc.index(desc) == nil
          collectedDesc.push(desc)
          boolean = false
        else
          boolean = true
        end
      }

      #limit to 5 results
      @synapses = @synapses.slice(0,5)
    elsif topic1id && !topic1id.empty?
      @one = Synapse.where('node1_id = ? AND node2_id = ?', topic1id, topic2id)
      @two = Synapse.where('node2_id = ? AND node1_id = ?', topic1id, topic2id)
      @synapses = @one + @two
      @synapses.sort! {|s1,s2| s1.desc <=> s2.desc }.to_a
      
      #permissions
      @synapses.delete_if {|s| s.permission == "private" && !authenticated? }
      @synapses.delete_if {|s| s.permission == "private" && authenticated? && current_user.id != s.user_id }
    else
      @synapses = []
    end

    render json: autocomplete_synapse_array_json(@synapses)
  end 

end
