class MetacodesController < ApplicationController
  before_filter :require_admin, except: [:index]
    
  # GET /metacodes
  # GET /metacodes.json
  def index
    @metacodes = Metacode.order("name").all
    @metacodes.map do |metacode|
      metacode.icon = ActionController::Base.helpers.asset_path(metacode.icon)
    end

    respond_to do |format|
      format.html {
        unless authenticated? && user.admin
          redirect_to root_url, notice: "You need to be an admin for that."
          return false
        end
        render :index
      }
      format.json { render json: @metacodes }
    end
  end

  # GET /metacodes/new
  # GET /metacodes/new.json
  def new
    @metacode = Metacode.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @metacode }
    end
  end

  # GET /metacodes/1/edit
  def edit
    @metacode = Metacode.find(params[:id])
  end

  # POST /metacodes
  # POST /metacodes.json
  def create
    @metacode = Metacode.new(metacode_params)

    respond_to do |format|
      if @metacode.save
        format.html { redirect_to metacodes_url, notice: 'Metacode was successfully created.' }
        format.json { render json: @metacode, status: :created, location: metacodes_url }
      else
        format.html { render :new }
        format.json { render json: @metacode.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /metacodes/1
  # PUT /metacodes/1.json
  def update
    @metacode = Metacode.find(params[:id])

    respond_to do |format|
      if @metacode.update(metacode_params)
        format.html { redirect_to metacodes_url, notice: 'Metacode was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render :edit }
        format.json { render json: @metacode.errors, status: :unprocessable_entity }
      end
    end
  end

  private

  # Never trust parameters from the scary internet, only allow the white list through.
  def metacode_params
    params.require(:metacode).permit(:id, :name, :icon, :color)
  end
end
