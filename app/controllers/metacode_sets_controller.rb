class MetacodeSetsController < ApplicationController
  
  before_filter :require_admin

  # GET /metacode_sets
  # GET /metacode_sets.json
  def index
    @metacode_sets = MetacodeSet.order("name").all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @metacode_sets }
    end
  end

  ### SHOW IS NOT CURRENTLY IN USE
  # GET /metacode_sets/1
  # GET /metacode_sets/1.json
#  def show
#    @metacode_set = MetacodeSet.find(params[:id])
#
#    respond_to do |format|
#      format.html # show.html.erb
#      format.json { render json: @metacode_set }
#    end
#  end

  # GET /metacode_sets/new
  # GET /metacode_sets/new.json
  def new
    @metacode_set = MetacodeSet.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @metacode_set }
    end
  end

  # GET /metacode_sets/1/edit
  def edit
    @metacode_set = MetacodeSet.find(params[:id])
  end

  # POST /metacode_sets
  # POST /metacode_sets.json
  def create
    @user = current_user
    @metacode_set = MetacodeSet.new(metacode_set_params)
    @metacode_set.user_id = @user.id

    respond_to do |format|
      if @metacode_set.save
        # create the InMetacodeSet for all the metacodes that were selected for the set
        @metacodes = params[:metacodes][:value].split(',')
        @metacodes.each do |m|
           InMetacodeSet.create(:metacode_id => m, :metacode_set_id => @metacode_set.id)
        end
        format.html { redirect_to metacode_sets_url, notice: 'Metacode set was successfully created.' }
        format.json { render json: @metacode_set, status: :created, location: metacode_sets_url }
      else
        format.html { render action: "new" }
        format.json { render json: @metacode_set.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /metacode_sets/1
  # PUT /metacode_sets/1.json
  def update
    @metacode_set = MetacodeSet.find(params[:id])

    respond_to do |format|
      if @metacode_set.update_attributes(metacode_set_params)
        
        # build an array of the IDs of the metacodes currently in the set
        @currentMetacodes = @metacode_set.metacodes.map{ |m| m.id.to_s }  
        # get the list of desired metacodes for the set from the user input and build an array out of it
        @newMetacodes = params[:metacodes][:value].split(',')
          
        #remove the metacodes that were in it, but now aren't
        @removedMetacodes = @currentMetacodes - @newMetacodes
        @removedMetacodes.each do |m|
          @inmetacodeset = InMetacodeSet.find_by_metacode_id_and_metacode_set_id(m, @metacode_set.id)
          @inmetacodeset.destroy
        end
          
        # add the new metacodes
        @addedMetacodes = @newMetacodes - @currentMetacodes
        @addedMetacodes.each do |m|
           InMetacodeSet.create(:metacode_id => m, :metacode_set_id => @metacode_set.id)
        end
        
        format.html { redirect_to metacode_sets_url, notice: 'Metacode set was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @metacode_set.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /metacode_sets/1
  # DELETE /metacode_sets/1.json
  def destroy
    @metacode_set = MetacodeSet.find(params[:id])
    
    #delete everything that tracks what's in the set  
    @metacode_set.in_metacode_sets.each do |m|
      m.destroy 
    end
      
    @metacode_set.destroy

    respond_to do |format|
      format.html { redirect_to metacode_sets_url }
      format.json { head :no_content }
    end
  end

  private

  def metacode_set_params
    params.require(:metacode_set).permit(:desc, :mapperContributed, :name)
  end
    
end
