class TopicsController < ApplicationController
    include TopicsHelper

    before_filter :require_user, only: [:create, :update, :destroy]

    respond_to :html, :js, :json

    # GET /topics/autocomplete_topic
    def autocomplete_topic
        @current = current_user
        term = params[:term]
        if term && !term.empty?
            # !connor term here needs to have .downcase
            @topics = Topic.where('LOWER("name") like ?', term.downcase + '%').order('"name"')

            #read this next line as 'delete a topic if its private and you're either 
            #1. logged out or 2. logged in but not the topic creator
            @topics.delete_if {|t| t.permission == "private" && 
                (!authenticated? || (authenticated? && @current.id != t.user_id)) }
        else
            @topics = []
        end
        render json: autocomplete_array_json(@topics)
    end

    # GET topics/:id
    def show
        @current = current_user
        @topic = Topic.find(params[:id]).authorize_to_show(@current)

        if not @topic
            redirect_to root_url and return
        end

        respond_to do |format|
            format.html { 
                @alltopics = [@topic] + @topic.relatives # should limit to topics visible to user
                @allsynapses = @topic.synapses # should also be limited

                respond_with(@allsynapses, @alltopics, @topic) 
            }
            format.json { render json: @topic }
        end
    end

    # GET topics/:id/network
    def network
        @current = current_user
        @topic = Topic.find(params[:id]).authorize_to_show(@current)

        if not @topic
            redirect_to root_url and return
        end

        @alltopics = @topic.relatives # should limit to topics visible to user
        @allsynapses = @topic.synapses # should also be limited

        @json = Hash.new()
        @json['topic'] = @topic
        @json['relatives'] = @alltopics
        @json['synapses'] = @allsynapses

        respond_to do |format|
            format.json { render json: @json }
        end
    end

    # POST /topics
    # POST /topics.json
    def create
        @topic = Topic.new(params[:topic])

        respond_to do |format|
            if @topic.save
                format.json { render json: @topic, status: :created }
            else
                format.json { render json: @topic.errors, status: :unprocessable_entity }
            end
        end
    end

    # PUT /topics/1
    # PUT /topics/1.json
    def update
        @topic = Topic.find(params[:id])

        respond_to do |format|
            if @topic.update_attributes(params[:topic])
                format.json { head :no_content }
            else
                format.json { render json: @topic.errors, status: :unprocessable_entity }
            end
        end
    end

    # DELETE topics/:id
    def destroy
        @current = current_user
        @topic = Topic.find(params[:id]).authorize_to_edit(@current)

        if @topic 
            @synapses = @topic.synapses
            @mappings = @topic.mappings

            @synapses.each do |synapse| 
                synapse.mappings.each do |m|

                    @map = m.map
                    @map.touch(:updated_at)

                    #push notify to anyone viewing same map in realtime (see mapping.rb to understand the 'message' action)
                    m.message 'destroy',@current.id

                    m.delete
                end

                synapse.delete
            end

            @mappings.each do |mapping| 

                @map = mapping.map
                @map.touch(:updated_at)

                #push notify to anyone viewing a map with this topic in realtime (see mapping.rb to understand the 'message' action)
                mapping.message 'destroy',@current.id

                mapping.delete
            end

            @topic.delete
        end

        respond_to do |format|
            format.js { render :json => "success" }
        end
    end
end
