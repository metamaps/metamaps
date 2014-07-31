class MapsController < ApplicationController

    before_filter :require_user, only: [:create, :update, :destroy]

    respond_to :html, :json

    autocomplete :map, :name, :full => true, :extra_data => [:user_id]

    # GET /maps/recent
    # GET /maps/featured
    # GET /maps/new
    # GET /maps/mappers/:id
    def index

        if request.path == "/maps"
            redirect_to activemaps_url and return
        end

        @current = current_user
        @user = nil

        if request.path =="/maps/active"
            @maps = Map.order("updated_at DESC").limit(20)
            @request = "active"

        elsif request.path =="/maps/featured"
            @maps = Map.order("name ASC").find_all_by_featured(true)
            @request = "featured"

        elsif request.path == "/maps/new"
            @maps = Map.order("created_at DESC").limit(20)
            @request = "new"

        elsif request.path.index('/maps/mappers/') != nil  # looking for maps by a mapper
            @user = User.find(params[:id])
            @maps = Map.order("name ASC").find_all_by_user_id(@user.id)
            @request = "you" if authenticated? && @user == @current
            @request = "other" if authenticated? && @user != @current

        elsif request.path.index('/maps/topics/') != nil  # looking for maps by a certain topic they include
            @topic = Topic.find(params[:id]).authorize_to_show(@current)
            if !@topic
                redirect_to featuredmaps_url, notice: "Access denied." and return
            end
            @maps = @topic.maps
            @request = "topic"
        end

        #read this next line as 'delete a map if its private and you're either 1. logged out or 2. logged in but not the map creator
        @maps.delete_if {|m| m.permission == "private" && (!authenticated? || (authenticated? && @current.id != m.user_id)) }

        respond_to do |format|
            format.html { respond_with(@maps, @request, @user) }
        end
    end

    # GET maps/:id
    def show

        @current = current_user
        @map = Map.find(params[:id]).authorize_to_show(@current)

        if not @map
            redirect_to root_url and return
        end

        @alltopics = @map.topics # should limit to topics visible to user
        @allsynapses = @map.synapses # should also be limited
        @allmappings = @map.mappings
        @allmetacodes = Metacode.all

        respond_to do |format|
            format.html { respond_with(@allmetacodes, @allmappings, @allsynapses, @alltopics, @map, @user) }
            format.json { render json: @map }
        end
    end

    # GET maps/:id/embed
    def embed
        @current = current_user
        @map = Map.find(params[:id]).authorize_to_show(@current)

        if not @map
            redirect_to root_url and return
        end

        @alltopics = @map.topics # should limit to topics visible to user
        @allsynapses = @map.synapses # should also be limited
        @allmappings = @map.mappings
        @allmetacodes = Metacode.all

        respond_to do |format|
            format.html { respond_with(@allmetacodes, @allmappings, @allsynapses, @alltopics, @map, @user) }
            format.json { render json: @map }
        end
    end

    # POST maps
    def create

        @user = current_user
        @map = Map.new()
        @map.name = params[:name]
        @map.desc = params[:desc]
        @map.permission = params[:permission]
        @map.user = @user
        @map.arranged = false 
        @map.save     

        if params[:topicsToMap]
            @all = params[:topicsToMap]
            @all = @all.split(',')
            @all.each do |topic|
                topic = topic.split('/')
                @mapping = Mapping.new()
                @mapping.category = "Topic"
                @mapping.user = @user
                @mapping.map  = @map
                @mapping.topic = Topic.find(topic[0])
                @mapping.xloc = topic[1]
                @mapping.yloc = topic[2]
                @mapping.save
            end

            if params[:synapsesToMap]
                @synAll = params[:synapsesToMap]
                @synAll = @synAll.split(',')
                @synAll.each do |synapse_id|
                    @mapping = Mapping.new()
                    @mapping.category = "Synapse"
                    @mapping.user = @user
                    @mapping.map = @map
                    @mapping.synapse = Synapse.find(synapse_id)
                    @mapping.save
                end
            end

            @map.arranged = true
            @map.save      
        end

        respond_to do |format|
            format.json { render :json => @map }
        end
    end

    # PUT maps/:id
    def update
        @current = current_user
        @map = Map.find(params[:id]).authorize_to_edit(@current)

        if @map 
            @map.name = params[:name] if params[:name]
            @map.desc = params[:desc] if params[:desc]
            @map.permission = params[:permission] if params[:permission]
            @map.save
        end

        respond_to do |format|
            format.json { render :json => @map }
        end
    end

    # DELETE maps/:id
    def destroy
        @current = current_user

        @map = Map.find(params[:id])

        @mappings = @map.mappings

        @mappings.each do |mapping| 
            mapping.delete
        end

        @map.delete

        respond_to do |format|
            format.html { redirect_to "/maps/mappers/" + @current.id.to_s, notice: "Map deleted." }
        end
    end
end
