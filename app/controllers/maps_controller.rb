class MapsController < ApplicationController

    before_action :require_user, only: [:create, :update, :screenshot, :events, :destroy]
    after_action :verify_authorized, except: [:activemaps, :featuredmaps, :mymaps, :usermaps, :events]
    after_action :verify_policy_scoped, only: [:activemaps, :featuredmaps, :mymaps, :usermaps]

    respond_to :html, :json, :csv

    autocomplete :map, :name, :full => true, :extra_data => [:user_id]

    # GET /explore/active
    def activemaps
        page = params[:page].present? ? params[:page] : 1
        @maps = policy_scope(Map).order("updated_at DESC")
          .page(page).per(20)

        respond_to do |format|
            format.html { 
              # root url => main/home. main/home renders maps/activemaps view.
              redirect_to root_url and return if authenticated?
              respond_with(@maps, @user) 
            }
            format.json { render json: @maps }
        end
    end

    # GET /explore/featured
    def featuredmaps
        page = params[:page].present? ? params[:page] : 1
        @maps = policy_scope(
          Map.where("maps.featured = ? AND maps.permission != ?",
                    true, "private")
        ).order("updated_at DESC").page(page).per(20)

        respond_to do |format|
            format.html { respond_with(@maps, @user) }
            format.json { render json: @maps }
        end
    end

    # GET /explore/mine
    def mymaps
        return redirect_to activemaps_url if !authenticated?

        page = params[:page].present? ? params[:page] : 1
        @maps = policy_scope(
          Map.where("maps.user_id = ?", current_user.id)
        ).order("updated_at DESC").page(page).per(20)

        respond_to do |format|
            format.html { respond_with(@maps, @user) }
            format.json { render json: @maps }
        end
    end

    # GET /explore/mapper/:id
    def usermaps
        page = params[:page].present? ? params[:page] : 1
        @user = User.find(params[:id])
        @maps = policy_scope(Map.where(user: @user))
          .order("updated_at DESC").page(page).per(20)

        respond_to do |format|
            format.html { respond_with(@maps, @user) }
            format.json { render json: @maps }
        end
    end

    # GET maps/:id
    def show
        @map = Map.find(params[:id])
        authorize @map

        respond_to do |format|
            format.html {
                @allmappers = @map.contributors
                @alltopics = @map.topics.to_a.delete_if {|t| t.permission == "private" && (!authenticated? || (authenticated? && current_user.id != t.user_id)) }
                @allsynapses = @map.synapses.to_a.delete_if {|s| s.permission == "private" && (!authenticated? || (authenticated? && current_user.id != s.user_id)) }
                @allmappings = @map.mappings.to_a.delete_if {|m| 
                    object = m.mappable
                    !object || (object.permission == "private" && (!authenticated? || (authenticated? && current_user.id != object.user_id)))
                }
                @allmessages = @map.messages.sort_by(&:created_at)

                respond_with(@allmappers, @allmappings, @allsynapses, @alltopics, @allmessages, @map)
            }
            format.json { render json: @map }
            format.csv { redirect_to action: :export, format: :csv }
            format.xls { redirect_to action: :export, format: :xls }
        end
    end

    # GET maps/:id/export
    def export
      map = Map.find(params[:id])
      authorize map
      exporter = MapExportService.new(current_user, map)
      respond_to do |format|
        format.json { render json: exporter.json }
        format.csv { send_data exporter.csv }
        format.xls { @spreadsheet = exporter.xls }
      end
    end

    # POST maps/:id/events/:event
    def events
      map = Map.find(params[:id])
      authorize map

      valid_event = false
      if params[:event] == 'conversation'
        Events::ConversationStartedOnMap.publish!(map, current_user)
        valid_event = true
      end

      respond_to do |format|
        format.json { 
          head :ok if valid_event
          head :bad_request if not valid_event
        }
      end
    end

    # GET maps/:id/contains
    def contains
        @map = Map.find(params[:id])
        authorize @map

        @allmappers = @map.contributors
        @alltopics = @map.topics.to_a.delete_if {|t| t.permission == "private" && (!authenticated? || (authenticated? && current_user.id != t.user_id)) }
        @allsynapses = @map.synapses.to_a.delete_if {|s| s.permission == "private" && (!authenticated? || (authenticated? && current_user.id != s.user_id)) }
        @allmappings = @map.mappings.to_a.delete_if {|m| 
            object = m.mappable
            !object || (object.permission == "private" && (!authenticated? || (authenticated? && current_user.id != object.user_id)))
        }

        @json = Hash.new()
        @json['map'] = @map
        @json['topics'] = @alltopics
        @json['synapses'] = @allsynapses
        @json['mappings'] = @allmappings
        @json['mappers'] = @allmappers
        @json['messages'] = @map.messages.sort_by(&:created_at)

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
                authorize mapping, :create
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
                    authorize mapping, :create
                    mapping.save
                end
            end

            @map.arranged = true
        end

        authorize @map

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
        @map = Map.find(params[:id])
        authorize @map

        respond_to do |format|
            if @map.update_attributes(map_params)
                format.json { head :no_content }
            else
                format.json { render json: @map.errors, status: :unprocessable_entity }
            end
        end
    end

    # POST maps/:id/upload_screenshot
    def screenshot
      @map = Map.find(params[:id])
      authorize @map

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
    end

    # DELETE maps/:id
    def destroy
      @map = Map.find(params[:id])
      authorize @map

      @map.delete

      respond_to do |format|
        format.json do
          head :no_content
        end
      end
    end

    private

    # Never trust parameters from the scary internet, only allow the white list through.
    def map_params
      params.require(:map).permit(:id, :name, :arranged, :desc, :permission)
    end
end
