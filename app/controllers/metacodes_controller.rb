# frozen_string_literal: true

class MetacodesController < ApplicationController
  before_action :require_admin, except: %i(index show)
  before_action :set_metacode, only: %i(edit update)

  # GET /metacodes
  # GET /metacodes.json
  def index
    @metacodes = Metacode.order('name').all

    respond_to do |format|
      format.html do
        return unless require_admin
        render :index
      end
      format.json { render json: @metacodes }
    end
  end

  # GET /metacodes/1.json
  # GET /metacodes/Action.json
  # GET /metacodes/action.json
  def show
    @metacode = Metacode.where('DOWNCASE(name) = ?', downcase(params[:name])).first if params[:name]
    set_metacode unless @metacode

    respond_to do |format|
      format.json { render json: @metacode }
    end
  end

  # GET /metacodes/new
  # GET /metacodes/new.json
  def new
    @metacode = Metacode.new

    respond_to do |format|
      format.html
      format.json { render json: @metacode }
    end
  end

  # GET /metacodes/1/edit
  def edit
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
    params.require(:metacode).permit(:id, :name, :aws_icon, :manual_icon, :color)
  end

  def set_metacode
    @metacode = Metacode.find(params[:id])
  end
end
