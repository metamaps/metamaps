class TopicsController < ApplicationController
    include TopicsHelper

    before_filter :require_user, only: [:create, :update, :destroy]

    respond_to :html, :js, :json

    # GET /topics/autocomplete_topic
    def autocomplete_topic
        @current = current_user
        term = params[:term]
        if term && !term.empty?
            @topics = Topic.where('LOWER("name") like ?', term.downcase + '%').order('"name"')

            #read this next line as 'delete a topic if its private and you're either 
            #1. logged out or 2. logged in but not the topic creator
            @topics.to_a.delete_if {|t| t.permission == "private" && 
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
            redirect_to root_url, notice: "Access denied. That topic is private." and return
        end

        respond_to do |format|
            format.html { 
                @alltopics = ([@topic] + @topic.relatives).delete_if {|t| t.permission == "private" && (!authenticated? || (authenticated? && @current.id != t.user_id)) } # should limit to topics visible to user
                @allsynapses = @topic.synapses.to_a.delete_if {|s| s.permission == "private" && (!authenticated? || (authenticated? && @current.id != s.user_id)) }

                @allcreators = []
                @alltopics.each do |t|
                    if @allcreators.index(t.user) == nil
                      @allcreators.push(t.user)
                    end
                end
                @allsynapses.each do |s|
                    if @allcreators.index(s.user) == nil
                      @allcreators.push(s.user)
                    end
                end

                respond_with(@allsynapses, @alltopics, @allcreators, @topic) 
            }
            format.json { render json: @topic }
        end
    end

    # GET topics/:id/network
    def network
        @current = current_user
        @topic = Topic.find(params[:id]).authorize_to_show(@current)

        if not @topic
            redirect_to root_url, notice: "Access denied. That topic is private." and return
        end

        @alltopics = @topic.relatives.to_a.delete_if {|t| t.permission == "private" && (!authenticated? || (authenticated? && @current.id != t.user_id)) }
        @allsynapses = @topic.synapses.to_a.delete_if {|s| s.permission == "private" && (!authenticated? || (authenticated? && @current.id != s.user_id)) }
        @allcreators = []
        @allcreators.push(@topic.user)
        @alltopics.each do |t|
            if @allcreators.index(t.user) == nil
              @allcreators.push(t.user)
            end
        end
        @allsynapses.each do |s|
            if @allcreators.index(s.user) == nil
              @allcreators.push(s.user)
            end
        end
                
        @json = Hash.new()
        @json['topic'] = @topic
        @json['creators'] = @allcreators
        @json['relatives'] = @alltopics
        @json['synapses'] = @allsynapses

        respond_to do |format|
            format.json { render json: @json }
        end
    end

    # GET topics/:id/relative_numbers
    def relative_numbers
        @current = current_user
        @topic = Topic.find(params[:id]).authorize_to_show(@current)

        if not @topic
            redirect_to root_url, notice: "Access denied. That topic is private." and return
        end

        @topicsAlreadyHas = params[:network] ? params[:network].split(',') : []

        @alltopics = @topic.relatives.to_a.delete_if {|t| 
            @topicsAlreadyHas.index(t.id.to_s) != nil ||
                (t.permission == "private" && (!authenticated? || (authenticated? && @current.id != t.user_id)))
        }

        @alltopics.uniq!

        @json = Hash.new()
        @alltopics.each do |t|
            if @json[t.metacode.id] 
                @json[t.metacode.id] += 1
            else
                @json[t.metacode.id] = 1
            end
        end

        respond_to do |format|
            format.json { render json: @json }
        end
    end

    # GET topics/:id/relatives
    def relatives
        @current = current_user
        @topic = Topic.find(params[:id]).authorize_to_show(@current)

        if not @topic
            redirect_to root_url, notice: "Access denied. That topic is private." and return
        end

        @topicsAlreadyHas = params[:network] ? params[:network].split(',') : []

        @alltopics = @topic.relatives.to_a.delete_if {|t| 
            @topicsAlreadyHas.index(t.id.to_s) != nil ||
                (params[:metacode] && t.metacode_id.to_s != params[:metacode]) ||
                (t.permission == "private" && (!authenticated? || (authenticated? && @current.id != t.user_id)))
        }

        @alltopics.uniq!

        @allsynapses = @topic.synapses.to_a.delete_if {|s|
            (s.topic1 == @topic && @alltopics.index(s.topic2) == nil) ||
            (s.topic2 == @topic && @alltopics.index(s.topic1) == nil)
        }

        @creatorsAlreadyHas = params[:creators] ? params[:creators].split(',') : []
        @allcreators = []
        @alltopics.each do |t|
            if @allcreators.index(t.user) == nil && @creatorsAlreadyHas.index(t.user_id.to_s) == nil
              @allcreators.push(t.user)
            end
        end
        @allsynapses.each do |s|
            if @allcreators.index(s.user) == nil && @creatorsAlreadyHas.index(s.user_id.to_s) == nil
              @allcreators.push(s.user)
            end
        end

        @json = Hash.new()
        @json['topics'] = @alltopics
        @json['synapses'] = @allsynapses
        @json['creators'] = @allcreators

        respond_to do |format|
            format.json { render json: @json }
        end
    end

    # POST /topics
    # POST /topics.json
    def create
        @topic = Topic.new(topic_params)

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
            if @topic.update_attributes(topic_params)
                format.json { head :no_content }
            else
                format.json { render json: @topic.errors, status: :unprocessable_entity }
            end
        end
    end

    # DELETE topics/:id
    def destroy
        @current = current_user
        @topic = Topic.find(params[:id]).authorize_to_delete(@current)
        @topic.delete if @topic

        respond_to do |format|
            format.json { head :no_content }
        end
    end

  private

  def topic_params
    params.require(:topic).permit(:id, :name, :desc, :link, :permission, :user_id, :metacode_id)
  end
end
