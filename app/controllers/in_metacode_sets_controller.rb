class InMetacodeSetsController < ApplicationController
  
  before_filter :require_admin  
    
  # GET /in_metacode_sets
  # GET /in_metacode_sets.json
  def index
    @in_metacode_sets = InMetacodeSet.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @in_metacode_sets }
    end
  end

  # GET /in_metacode_sets/1
  # GET /in_metacode_sets/1.json
  def show
    @in_metacode_set = InMetacodeSet.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @in_metacode_set }
    end
  end

  # GET /in_metacode_sets/new
  # GET /in_metacode_sets/new.json
  def new
    @in_metacode_set = InMetacodeSet.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @in_metacode_set }
    end
  end

  # GET /in_metacode_sets/1/edit
  def edit
    @in_metacode_set = InMetacodeSet.find(params[:id])
  end

  # POST /in_metacode_sets
  # POST /in_metacode_sets.json
  def create
    @in_metacode_set = InMetacodeSet.new(params[:in_metacode_set])

    respond_to do |format|
      if @in_metacode_set.save
        format.html { redirect_to @in_metacode_set, notice: 'In metacode set was successfully created.' }
        format.json { render json: @in_metacode_set, status: :created, location: @in_metacode_set }
      else
        format.html { render action: "new" }
        format.json { render json: @in_metacode_set.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /in_metacode_sets/1
  # PUT /in_metacode_sets/1.json
  def update
    @in_metacode_set = InMetacodeSet.find(params[:id])

    respond_to do |format|
      if @in_metacode_set.update_attributes(params[:in_metacode_set])
        format.html { redirect_to @in_metacode_set, notice: 'In metacode set was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @in_metacode_set.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /in_metacode_sets/1
  # DELETE /in_metacode_sets/1.json
  def destroy
    @in_metacode_set = InMetacodeSet.find(params[:id])
    @in_metacode_set.destroy

    respond_to do |format|
      format.html { redirect_to in_metacode_sets_url }
      format.json { head :no_content }
    end
  end
end
