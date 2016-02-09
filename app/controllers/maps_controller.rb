class MapsController < ApplicationController
    before_filter :require_user, only: [:create, :update, :screenshot, :destroy]

    respond_to :html, :json

    autocomplete :map, :name, :full => true, :extra_data => [:user_id]

    # GET /explore/active
    # GET /explore/featured
    # GET /explore/mapper/:id
    def index
        return redirect_to activemaps_url if request.path == "/explore"

        @current = current_user
        @maps = []
        page = params[:page].present? ? params[:page] : 1

        if request.path.index("/explore/active") != nil
            @maps = Map.where("maps.permission != ?", "private").order("updated_at DESC").page(page).per(20)
            @request = "active"
        elsif request.path.index("/explore/featured") != nil
            @maps = Map.where("maps.featured = ? AND maps.permission != ?", true, "private").order("updated_at DESC").page(page).per(20)
            @request = "featured"
        elsif request.path.index('/explore/mine') != nil  # looking for maps by me
            return redirect_to activemaps_url if !authenticated?

            # don't need to exclude private maps because they all belong to you
            @maps = Map.where("maps.user_id = ?", @current.id).order("updated_at DESC").page(page).per(20)
            @request = "you"
        elsif request.path.index('/explore/mapper/') != nil  # looking for maps by a mapper
            @user = User.find(params[:id])
            @maps = Map.where("maps.user_id = ? AND maps.permission != ?", @user.id, "private").order("updated_at DESC").page(page).per(20)
            @request = "mapper"
        end

        respond_to do |format|
            format.html { 
                if @request == "active" && authenticated?
                    redirect_to root_url and return
                end
                respond_with(@maps, @request, @user)
            }
            format.json { render json: @maps }
        end
    end

    # GET maps/:id
    def show

        @current = current_user
        @map = Map.find(params[:id]).authorize_to_show(@current)

        if not @map
            redirect_to root_url, notice: "Access denied. That map is private." and return
        end

        respond_to do |format|
            format.html { 
                @allmappers = @map.contributors
                @alltopics = @map.topics.to_a.delete_if {|t| t.permission == "private" && (!authenticated? || (authenticated? && @current.id != t.user_id)) }
                @allsynapses = @map.synapses.to_a.delete_if {|s| s.permission == "private" && (!authenticated? || (authenticated? && @current.id != s.user_id)) }
                @allmappings = @map.mappings.to_a.delete_if {|m| 
                    object = m.mappable
                    !object || (object.permission == "private" && (!authenticated? || (authenticated? && @current.id != object.user_id)))
                }

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
            redirect_to root_url, notice: "Access denied. That map is private." and return
        end

        @allmappers = @map.contributors
        @alltopics = @map.topics.to_a.delete_if {|t| t.permission == "private" && (!authenticated? || (authenticated? && @current.id != t.user_id)) }
        @allsynapses = @map.synapses.to_a.delete_if {|s| s.permission == "private" && (!authenticated? || (authenticated? && @current.id != s.user_id)) }
        @allmappings = @map.mappings.to_a.delete_if {|m| 
            object = m.mappable
            !object || (object.permission == "private" && (!authenticated? || (authenticated? && @current.id != object.user_id)))
        }

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

    # POST maps
    def create
        @user = current_user
        @map = Map.new()
        @map.name = params[:name]
        @map.desc = params[:desc]
        @map.permission = params[:permission]
        @map.user = @user
        @map.arranged = false 

        if params[:topicsToMap]
            @all = params[:topicsToMap]
            @all = @all.split(',')
            @all.each do |topic|
                topic = topic.split('/')
                mapping = Mapping.new()
                mapping.user = @user
                mapping.mappable = Topic.find(topic[0])
                mapping.xloc = topic[1]
                mapping.yloc = topic[2]
                @map.topicmappings << mapping
                mapping.save
            end

            if params[:synapsesToMap]
                @synAll = params[:synapsesToMap]
                @synAll = @synAll.split(',')
                @synAll.each do |synapse_id|
                    mapping = Mapping.new()
                    mapping.user = @user
                    mapping.map = @map
                    mapping.mappable = Synapse.find(synapse_id)
                    @map.synapsemappings << mapping
                    mapping.save
                end
            end

            @map.arranged = true
        end

        if @map.save
          respond_to do |format|
            format.json { render :json => @map }
          end
        else
          respond_to do |format|
            format.json { render :json => "invalid params" }
          end
        end
    end

    # PUT maps/:id
    def update
        @current = current_user
        @map = Map.find(params[:id]).authorize_to_edit(@current)

        respond_to do |format|
            if !@map 
                format.json { render json: "unauthorized" }
            elsif @map.update_attributes(map_params)
                format.json { head :no_content }
            else
                format.json { render json: @map.errors, status: :unprocessable_entity }
            end
        end
    end

    # POST maps/:id/upload_screenshot
    def screenshot
        @current = current_user
        @map = Map.find(params[:id]).authorize_to_edit(@current)

        if @map
          png = Base64.decode64(params[:encoded_image]['data:image/png;base64,'.length .. -1])
          StringIO.open(png) do |data|
            data.class.class_eval { attr_accessor :original_filename, :content_type }
            data.original_filename = "map-" + @map.id.to_s + "-screenshot.png"
            data.content_type = "image/png"
            @map.screenshot = data
          end
          
          if @map.save
            render :json => {:message => "Successfully uploaded the map screenshot."}
          else
            render :json => {:message => "Failed to upload image."}
          end
        else
            render :json => {:message => "Unauthorized to set map screenshot."}
        end
    end

    # DELETE maps/:id
    def destroy
        @current = current_user

        @map = Map.find(params[:id]).authorize_to_delete(@current)

        @map.delete if @map

        respond_to do |format|
            format.json { 
                if @map
                    render json: "success"
                else
                    render json: "unauthorized"
                end
            }
        end
    end

    private

    # Never trust parameters from the scary internet, only allow the white list through.
    def map_params
      params.require(:map).permit(:id, :name, :arranged, :desc, :permission, :user_id)
    end
end
