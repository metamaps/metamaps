class UsersController < ApplicationController
  before_filter :require_user, only: [:edit, :update, :updatemetacodes]
    
  respond_to :html, :json 

  # GET /users/1.json
  def show
    @user = User.find(params[:id])

    render json: @user
  end  
    
  # GET /users/:id/edit
  def edit
    @user = current_user
    respond_with(@user)  
  end
  
  # PUT /users/:id
  def update
    @user = current_user

    if user_params[:password] == "" && user_params[:password_confirmation] == ""
      # not trying to change the password
      if @user.update_attributes(user_params.except(:password, :password_confirmation))
        if params[:remove_image] == "1"
          @user.image = nil
        end
        @user.save
        sign_in(@user, :bypass => true)
        respond_to do |format|
          format.html { redirect_to root_url, notice: "Account updated!" }
        end
      else
        sign_in(@user, :bypass => true)
        respond_to do |format|
          format.html { redirect_to edit_user_path(@user), notice: @user.errors.to_a[0] }
        end
      end
    else
      # trying to change the password
      correct_pass = @user.valid_password?(params[:current_password])

      if correct_pass && @user.update_attributes(user_params)
        if params[:remove_image] == "1"
          @user.image = nil
        end
        @user.save
        sign_in(@user, :bypass => true)
        respond_to do |format|
          format.html { redirect_to root_url, notice: "Account updated!" }
        end
      else
        respond_to do |format|
          if correct_pass
            u = User.find(@user.id)
            sign_in(u, :bypass => true)
            format.html { redirect_to edit_user_path(@user), notice: @user.errors.to_a[0] }
          else
            sign_in(@user, :bypass => true)
            format.html { redirect_to edit_user_path(@user), notice: "Incorrect current password" }
          end
        end
      end
    end
  end
    
  # GET /users/:id/details [.json]
  def details
    @user = User.find(params[:id])
    
    @details = Hash.new

    @details['name'] = @user.name
    @details['created_at'] = @user.created_at.strftime("%m/%d/%Y")
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
    @user.settings.metacodes=@m.split(',')
    
    @user.save

    respond_to do |format|
      format.json { render json: @user }
    end
  end

  private

  def user_params
    params.require(:user).permit(:name, :email, :image, :password, :password_confirmation)
  end
end
