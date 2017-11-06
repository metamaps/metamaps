# frozen_string_literal: true

class TopicsController < ApplicationController
  include TopicsHelper

  before_action :require_user, only: %i(create update destroy follow unfollow)
  before_action :set_topic, only: %i(show update relative_numbers
                                     relatives network destroy
                                     follow unfollow unfollow_from_email)
  after_action :verify_authorized, except: :autocomplete_topic

  respond_to :html, :js, :json

  # GET /topics/autocomplete_topic
  def autocomplete_topic
    term = params[:term]
    if term.present?
      topics = policy_scope(Topic)
               .where('LOWER("name") like ?', term.downcase + '%')
               .order('"name"')
      map_topics = topics.select { |t| t&.metacode&.name == 'Metamap' }
      # prioritize topics which point to maps, over maps
      exclude = map_topics.length.positive? ? map_topics.map(&:name) : ['']
      maps = policy_scope(Map)
             .where('LOWER("name") like ? AND name NOT IN (?)', term.downcase + '%', exclude)
             .order('"name"')
    else
      topics = []
      maps = []
    end
    @all = topics.to_a.concat(maps.to_a).sort_by(&:name)

    render json: autocomplete_array_json(@all).to_json
  end

  # GET topics/:id
  def show
    respond_to do |format|
      format.html do
        @alltopics = [@topic].concat(policy_scope(Topic.relatives(@topic.id, current_user)).to_a)
        @allsynapses = policy_scope(Synapse.for_topic(@topic.id)).to_a
        @allcreators = @alltopics.map(&:user).uniq
        @allcreators += @allsynapses.map(&:user).uniq

        respond_with(@allsynapses, @alltopics, @allcreators, @topic)
      end
      format.json { render json: @topic.as_json(user: current_user).to_json }
    end
  end

  # GET topics/:id/network
  def network
    @alltopics = [@topic].concat(policy_scope(Topic.relatives(@topic.id, current_user)).to_a)
    @allsynapses = policy_scope(Synapse.for_topic(@topic.id))

    @allcreators = @alltopics.map(&:user).uniq
    @allcreators += @allsynapses.map(&:user).uniq

    @json = {}
    @json['topic'] = @topic.as_json(user: current_user)
    @json['creators'] = @allcreators
    @json['relatives'] = @alltopics.as_json(user: current_user)
    @json['synapses'] = @allsynapses

    respond_to do |format|
      format.json { render json: @json }
    end
  end

  # GET topics/:id/relative_numbers
  def relative_numbers
    topics_already_has = params[:network] ? params[:network].split(',').map(&:to_i) : []

    alltopics = policy_scope(Topic.relatives(@topic.id, current_user)).to_a
    if params[:metacode].present?
      alltopics.delete_if { |topic| topic.metacode_id != params[:metacode].to_i }
    end
    alltopics.delete_if { |topic| !topics_already_has.index(topic.id).nil? }

    @json = Hash.new(0)
    alltopics.each do |t|
      @json[t.metacode.id] += 1
    end

    respond_to do |format|
      format.json { render json: @json }
    end
  end

  # GET topics/:id/relatives
  def relatives
    topics_already_has = params[:network] ? params[:network].split(',').map(&:to_i) : []

    alltopics = policy_scope(Topic.relatives(@topic.id, current_user)).to_a
    if params[:metacode].present?
      alltopics.delete_if { |topic| topic.metacode_id != params[:metacode].to_i }
    end
    alltopics.delete_if do |topic|
      !topics_already_has.index(topic.id.to_s).nil?
    end

    # find synapses between topics in alltopics array
    allsynapses = policy_scope(Synapse.for_topic(@topic.id)).to_a
    synapse_ids = (allsynapses.map(&:topic1_id) + allsynapses.map(&:topic2_id)).uniq
    allsynapses.delete_if do |synapse|
      !synapse_ids.index(synapse.id).nil?
    end

    creators_already_has = params[:creators] ? params[:creators].split(',').map(&:to_i) : []
    allcreators = (alltopics.map(&:user) + allsynapses.map(&:user)).uniq.delete_if do |user|
      !creators_already_has.index(user.id).nil?
    end

    @json = {}
    @json['topics'] = alltopics.as_json(user: current_user)
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
    @topic.user = current_user
    @topic.updated_by = current_user

    respond_to do |format|
      if @topic.save
        format.json { render json: @topic.as_json(user: current_user), status: :created }
      else
        format.json { render json: @topic.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /topics/1
  # PUT /topics/1.json
  def update
    @topic.updated_by = current_user
    @topic.assign_attributes(topic_params)

    respond_to do |format|
      if @topic.save
        format.json { head :no_content }
      else
        format.json { render json: @topic.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE topics/:id
  def destroy
    @topic.updated_by = current_user
    @topic.destroy
    respond_to do |format|
      format.json { head :no_content }
    end
  end

  # POST topics/:id/follow
  def follow
    follow = FollowService.follow(@topic, current_user, 'followed')

    respond_to do |format|
      format.json do
        if follow
          head :ok
        else
          head :bad_request
        end
      end
    end
  end

  # POST topics/:id/unfollow
  def unfollow
    FollowService.unfollow(@topic, current_user)

    respond_to do |format|
      format.json do
        head :ok
      end
    end
  end

  # GET topics/:id/unfollow_from_email
  def unfollow_from_email
    FollowService.unfollow(@topic, current_user)

    respond_to do |format|
      format.html do
        redirect_to topic_path(@topic), notice: 'You are no longer following this topic'
      end
    end
  end

  private

  def set_topic
    @topic = Topic.find(params[:id])
    authorize @topic
  end

  def topic_params
    params.require(:topic).permit(:id, :name, :desc, :link, :permission, :metacode_id, :defer_to_map_id)
  end
end
