# frozen_string_literal: true

class UsersController < ApplicationController
  before_action :require_user, only: %i[edit update updatemetacodes update_metacode_focus]

  respond_to :html, :json

  # GET /users/1.json
  def show
    @user = User.find(params[:id])

    render json: @user
  end

  # GET /users/:id/edit
  def edit
    @user = User.find(current_user.id)
  end

  # PUT /users/:id
  def update
    @user = User.find(current_user.id)

    if user_params[:password] == '' && user_params[:password_confirmation] == ''
      # not trying to change the password
      if @user.update_attributes(user_params.except(:password, :password_confirmation))
        update_follow_settings(@user, params[:settings])
        @user.image = nil if params[:remove_image] == '1'
        @user.save
        bypass_sign_in(@user)
        respond_to do |format|
          format.html { redirect_to root_url, notice: 'Settings updated' }
        end
      else
        bypass_sign_in(@user)
        respond_to do |format|
          format.html { redirect_to edit_user_path(@user), notice: @user.errors.to_a[0] }
        end
      end
    else
      # trying to change the password
      correct_pass = @user.valid_password?(params[:current_password])

      if correct_pass && @user.update_attributes(user_params)
        update_follow_settings(@user, params[:settings]) if is_tester(@user)
        @user.image = nil if params[:remove_image] == '1'
        @user.save
        sign_in(@user, bypass: true)
        respond_to do |format|
          format.html { redirect_to root_url, notice: 'Settings updated' }
        end
      else
        respond_to do |format|
          if correct_pass
            u = User.find(@user.id)
            sign_in(u, bypass: true)
            format.html { redirect_to edit_user_path(@user), notice: @user.errors.to_a[0] }
          else
            sign_in(@user, bypass: true)
            format.html { redirect_to edit_user_path(@user), notice: 'Incorrect current password' }
          end
        end
      end
    end
  end

  # GET /users/:id/details [.json]
  def details
    @user = User.find(params[:id])

    @details = {}

    @details['name'] = @user.name
    @details['created_at'] = @user.created_at.strftime('%m/%d/%Y')
    @details['image'] = @user.image.url(:ninetysix)
    @details['generation'] = @user.generation
    @details['numSynapses'] = @user.synapses.count
    @details['numTopics'] = @user.topics.count
    @details['numMaps'] = @user.maps.count

    render json: @details
  end

  # PUT /user/updatemetacodes
  def updatemetacodes
    @user = current_user

    @m = params[:metacodes][:value]
    @user.settings.metacodes = @m.split(',')

    @user.save

    respond_to do |format|
      format.json { render json: @user }
    end
  end

  # PUT /user/update_metacode_focus
  def update_metacode_focus
    @user = current_user
    @user.settings.metacode_focus = params[:value]
    @user.save
    respond_to do |format|
      format.json { render json: { success: 'success' } }
    end
  end

  private

  def update_follow_settings(user, settings)
    user.settings.follow_topic_on_created = settings[:follow_topic_on_created]
    user.settings.follow_topic_on_contributed = settings[:follow_topic_on_contributed]
    user.settings.follow_map_on_created = settings[:follow_map_on_created]
    user.settings.follow_map_on_contributed = settings[:follow_map_on_contributed]
  end

  def user_params
    params.require(:user).permit(
      :name, :email, :image, :password, :password_confirmation, :emails_allowed, :settings
    )
  end
end
