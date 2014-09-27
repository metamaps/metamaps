class MapsController < ApplicationController

    before_filter :require_user, only: [:create, :update, :destroy]

    respond_to :html, :json

    autocomplete :map, :name, :full => true, :extra_data => [:user_id]

    # GET /maps/recent
    # GET /maps/featured
    # GET /maps/new
    # GET /maps/mappers/:id
    def index

        if request.path == "/explore"
            redirect_to activemaps_url and return
        end

        @current = current_user
        @user = nil
        @maps = []

        if !params[:page] 
            page = 1
        else 
            page = params[:page]
        end

        if request.path.index("/explore/active") != nil
            @maps = Map.where("maps.permission != ?", "private").order("updated_at DESC").page(page).per(20)
            @request = "active"

        elsif request.path.index("/explore/featured") != nil
            @maps = Map.where("maps.featured = ? AND maps.permission != ?", true, "private").order("name ASC").page(page).per(20)
            @request = "featured"

        elsif request.path.index('/explore/mine') != nil  # looking for maps by me
            if !authenticated?
                redirect_to activemaps_url and return
            end
            # don't need to exclude private maps because they all belong to you
            @maps = Map.where("maps.user_id = ?", @current.id).order("name ASC").page(page).per(20)
            @request = "you"

        elsif request.path.index('/explore/mappers/') != nil  # looking for maps by a mapper
            @user = User.find(params[:id])
            @maps = Map.where("maps.user_id = ? AND maps.permission != ?", @user.id, "private").order("name ASC").page(page).per(20)
            @request = "other"

        elsif request.path.index('/explore/topics/') != nil  # looking for maps by a certain topic they include
            @topic = Topic.find(params[:id]).authorize_to_show(@current)
            if !@topic
                redirect_to featuredmaps_url, notice: "Access denied." and return
            end
            @maps = @topic.maps.delete_if {|m| m.permission == "private" && (!authenticated? || (authenticated? && @current.id != m.user_id)) }
            @request = "topic"
        end

        respond_to do |format|
            format.html { 
                if @request == "you"
                    redirect_to root_url and return
                else
                    respond_with(@maps, @request, @user) 
                end
            }
            format.json { render json: @maps }
        end
    end

    # GET maps/:id
    def show

        @current = current_user
        @map = Map.find(params[:id]).authorize_to_show(@current)

        if not @map
            redirect_to root_url and return
        end

        respond_to do |format|
            format.html { 
                @allmappers = @map.contributors
                @alltopics = @map.topics # should limit to topics visible to user
                @allsynapses = @map.synapses # should also be limited
                @allmappings = @map.mappings

                respond_with(@allmappers, @allmappings, @allsynapses, @alltopics, @map) 
            }
            format.json { render json: @map }
        end
    end

    # GET maps/:id/contains
    def contains

        @current = current_user
        @map = Map.find(params[:id]).authorize_to_show(@current)

        if not @map
            redirect_to root_url and return
        end

        @allmappers = @map.contributors
        @alltopics = @map.topics # should limit to topics visible to user
        @allsynapses = @map.synapses # should also be limited
        @allmappings = @map.mappings

        @json = Hash.new()
        @json['map'] = @map
        @json['topics'] = @alltopics
        @json['synapses'] = @allsynapses
        @json['mappings'] = @allmappings
        @json['mappers'] = @allmappers

        respond_to do |format|
            format.json { render json: @json }
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

        respond_to do |format|
            if !@map 
                format.json { render json: "unauthorized" }
            elsif @map.update_attributes(params[:map])
                format.json { head :no_content }
            else
                format.json { render json: @map.errors, status: :unprocessable_entity }
            end
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
