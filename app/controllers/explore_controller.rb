class ExploreController < ApplicationController
  before_action :authorize_explore
  after_action :verify_authorized
  after_action :verify_policy_scoped

  respond_to :html, :json, :csv

  # TODO remove?
  #autocomplete :map, :name, full: true, extra_data: [:user_id]

  # GET /explore/active
  def activemaps
    page = params[:page].present? ? params[:page] : 1
    @maps = policy_scope(Map).order('updated_at DESC')
                             .page(page).per(20)

    respond_to do |format|
      format.html do
        # root url => main/home. main/home renders maps/activemaps view.
        redirect_to(root_url) && return if authenticated?
        respond_with(@maps, @user)
      end
      format.json { render json: @maps }
    end
  end

  # GET /explore/featured
  def featuredmaps
    page = params[:page].present? ? params[:page] : 1
    @maps = policy_scope(
      Map.where('maps.featured = ? AND maps.permission != ?',
                true, 'private')
    ).order('updated_at DESC').page(page).per(20)

    respond_to do |format|
      format.html { respond_with(@maps, @user) }
      format.json { render json: @maps }
    end
  end

  # GET /explore/mine
  def mymaps
    unless authenticated?
      skip_policy_scope
      return redirect_to explore_active_path
    end

    page = params[:page].present? ? params[:page] : 1
    @maps = policy_scope(
      Map.where('maps.user_id = ?', current_user.id)
    ).order('updated_at DESC').page(page).per(20)

    respond_to do |format|
      format.html { respond_with(@maps, @user) }
      format.json { render json: @maps }
    end
  end

  # GET /explore/shared
  def sharedmaps
    unless authenticated?
      skip_policy_scope
      return redirect_to explore_active_path
    end

    page = params[:page].present? ? params[:page] : 1
    @maps = policy_scope(
      Map.where('maps.id IN (?)', current_user.shared_maps.map(&:id))
    ).order('updated_at DESC').page(page).per(20)

    respond_to do |format|
      format.html { respond_with(@maps, @user) }
      format.json { render json: @maps }
    end
  end

  # GET /explore/starred
  def starredmaps
    unless authenticated?
      skip_policy_scope
      return redirect_to explore_active_path
    end

    page = params[:page].present? ? params[:page] : 1
    stars = current_user.stars.map(&:map_id)
    @maps = policy_scope(
      Map.where('maps.id IN (?)', stars)
    ).order('updated_at DESC').page(page).per(20)

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
            .order('updated_at DESC').page(page).per(20)

    respond_to do |format|
      format.html { respond_with(@maps, @user) }
      format.json { render json: @maps }
    end
  end

  private

  def authorize_explore
    authorize :Explore
  end
end
