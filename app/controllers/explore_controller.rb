# frozen_string_literal: true

class ExploreController < ApplicationController
  before_action :require_authentication, only: %i[mine shared starred]
  before_action :authorize_explore
  after_action :verify_authorized
  after_action :verify_policy_scoped

  respond_to :html, :json, :csv

  # GET /explore/active
  def active
    @maps = map_scope(Map.where.not(name: 'Untitled Map').where.not(permission: 'private'))

    respond_to do |format|
      format.html do
        # root url => main/home. main/home renders maps/activemaps view.
        redirect_to(root_url) && return if authenticated?
        respond_with(@maps, @user)
      end
      format.json { render json: @maps.to_json }
    end
  end

  # GET /explore/featured
  def featured
    @maps = map_scope(Map.where(featured: true))

    respond_to do |format|
      format.html { respond_with(@maps, @user) }
      format.json { render json: @maps.to_json }
    end
  end

  # GET /explore/mine
  def mine
    @maps = map_scope(Map.where(user_id: current_user.id))

    respond_to do |format|
      format.html { respond_with(@maps, @user) }
      format.json { render json: @maps.to_json }
    end
  end

  # GET /explore/shared
  def shared
    @maps = map_scope(Map.where(id: current_user.shared_maps.map(&:id)))

    respond_to do |format|
      format.html { respond_with(@maps, @user) }
      format.json { render json: @maps.to_json }
    end
  end

  # GET /explore/starred
  def starred
    @maps = map_scope(Map.where(id: current_user.stars.map(&:map_id)))

    respond_to do |format|
      format.html { respond_with(@maps, @user) }
      format.json { render json: @maps.to_json }
    end
  end

  # GET /explore/mapper/:id
  def mapper
    @user = User.find(params[:id])
    @maps = map_scope(Map.where(user: @user))

    respond_to do |format|
      format.html { respond_with(@maps, @user) }
      format.json { render json: @maps.to_json }
    end
  end

  private

  def map_scope(scope)
    policy_scope(scope).order(updated_at: :desc).page(params[:page]).per(20)
  end

  def authorize_explore
    authorize :Explore
  end

  def require_authentication
    # skip_policy_scope
    redirect_to explore_active_path unless authenticated?
  end
end
