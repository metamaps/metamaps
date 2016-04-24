class TopicsController < ApplicationController
    include TopicsHelper

    before_action :require_user, only: [:create, :update, :destroy]
    after_action :verify_authorized, except: :autocomplete_topic
   
    respond_to :html, :js, :json

    # GET /topics/autocomplete_topic
    def autocomplete_topic
        term = params[:term]
        if term && !term.empty?
            @topics = policy_scope(Topic.where('LOWER("name") like ?', term.downcase + '%')).order('"name"')
        else
            @topics = []
        end
        render json: autocomplete_array_json(@topics)
    end

    # GET topics/:id
    def show
        @topic = Topic.find(params[:id])
        authorize @topic

        respond_to do |format|
            format.html { 
                @alltopics = [@topic].concat(policy_scope(Topic.relatives1(@topic.id)).to_a).concat(policy_scope(Topic.relatives2(@topic.id)).to_a)
                @allsynapses = policy_scope(Synapse.for_topic(@topic.id)).to_a
puts @alltopics.length
puts @allsynapses.length
                @allcreators = @alltopics.map(&:user).uniq
                @allcreators += @allsynapses.map(&:user).uniq

                respond_with(@allsynapses, @alltopics, @allcreators, @topic) 
            }
            format.json { render json: @topic }
        end
    end

    # GET topics/:id/network
    def network
        @topic = Topic.find(params[:id])
        authorize @topic

        @alltopics = [@topic].concat(policy_scope(Topic.relatives1(@topic.id)).to_a).concat(policy_scope(Topic.relatives2(@topic.id)).to_a)
        @allsynapses = policy_scope(Synapse.for_topic(@topic.id))

        @allcreators = @alltopics.map(&:user).uniq
        @allcreators += @allsynapses.map(&:user).uniq

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
        @topic = Topic.find(params[:id])
        authorize @topic

        topicsAlreadyHas = params[:network] ? params[:network].split(',').map(&:to_i) : []

        @alltopics = policy_scope(Topic.relatives1(@topic.id)).to_a.concat(policy_scope(Topic.relatives2(@topic.id)).to_a).uniq
        @alltopics.delete_if do |topic|
          topicsAlreadyHas.index(topic.id) != nil
        end

        @json = Hash.new(0)
        @alltopics.each do |t|
          @json[t.metacode.id] += 1
        end

        respond_to do |format|
          format.json { render json: @json }
        end
    end

    # GET topics/:id/relatives
    def relatives
      @topic = Topic.find(params[:id])
      authorize @topic

      topicsAlreadyHas = params[:network] ? params[:network].split(',').map(&:to_i) : []

      alltopics =  policy_scope(Topic.relatives1(@topic.id)).to_a.concat(policy_scope(Topic.relatives2(@topic.id)).to_a).uniq
      alltopics.delete_if do |topic| 
        topicsAlreadyHas.index(topic.id.to_s) != nil
      end

      #find synapses between topics in alltopics array
      allsynapses = policy_scope(Synapse.for_topic(@topic.id)).to_a
      synapse_ids = (allsynapses.map(&:node1_id) + allsynapses.map(&:node2_id)).uniq
      allsynapses.delete_if do |synapse|
        synapse_ids.index(synapse.id) != nil
      end

      creatorsAlreadyHas = params[:creators] ? params[:creators].split(',').map(&:to_i) : []
      allcreators = (alltopics.map(&:user) + allsynapses.map(&:user)).uniq.delete_if do |user|
        creatorsAlreadyHas.index(user.id) != nil
      end

      @json = Hash.new()
      @json['topics'] = alltopics
      @json['synapses'] = allsynapses
      @json['creators'] = allcreators

      respond_to do |format|
        format.json { render json: @json }
      end
    end

  # POST /topics
  # POST /topics.json
  def create
    @topic = Topic.new(topic_params)
    authorize @topic

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
    authorize @topic

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
    @topic = Topic.find(params[:id])
    authorize @topic

    @topic.destroy
    respond_to do |format|
      format.json { head :no_content }
    end
  end

  private

  def topic_params
    params.require(:topic).permit(:id, :name, :desc, :link, :permission, :user_id, :metacode_id, :defer_to_map_id)
  end
end
