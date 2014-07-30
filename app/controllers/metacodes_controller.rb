class MetacodesController < ApplicationController
  
  before_filter :require_admin, except: [:index]
    
  # GET /metacodes
  # GET /metacodes.json
  def index
      
    @metacodes = Metacode.order("name").all

    respond_to do |format|
      format.html {
        unless authenticated? && user.admin
          redirect_to root_url, notice: "You need to be an admin for that."
          return false
        end
        render action: "index"
      }
      format.json { render json: @metacodes }
    end
  end

  ### SHOW IS CURRENTLY DISABLED
  # GET /metacodes/1
  # GET /metacodes/1.json
#  def show
#    @metacode = Metacode.find(params[:id])
#
#    respond_to do |format|
#      format.html # show.html.erb
#      format.json { render json: @metacode }
#    end
#  end

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
    @metacode = Metacode.new(params[:metacode])

    respond_to do |format|
      if @metacode.save
        format.html { redirect_to metacodes_url, notice: 'Metacode was successfully created.' }
        format.json { render json: @metacode, status: :created, location: metacodes_url }
      else
        format.html { render action: "new" }
        format.json { render json: @metacode.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /metacodes/1
  # PUT /metacodes/1.json
  def update
    @metacode = Metacode.find(params[:id])

    respond_to do |format|
      if @metacode.update_attributes(params[:metacode])
        format.html { redirect_to metacodes_url, notice: 'Metacode was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @metacode.errors, status: :unprocessable_entity }
      end
    end
  end

    
  ### DESTROY IS CURRENTLY DISABLED
  # DELETE /metacodes/1
  # DELETE /metacodes/1.json
#  def destroy
#    @metacode = Metacode.find(params[:id])
#    @metacode.destroy
#
#    respond_to do |format|
#      format.html { redirect_to metacodes_url }
#      format.json { head :no_content }
#    end
#  end
end
