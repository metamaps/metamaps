# frozen_string_literal: true

class MetacodesController < ApplicationController
  before_action :require_admin, except: %i[index show]
  before_action :set_metacode, only: %i[update]

  # GET /metacodes
  def index
    @metacodes = Metacode.order('name').all
    render json: @metacodes
  end

  # GET /metacodes/1
  # GET /metacodes/Action
  # GET /metacodes/action
  def show
    @metacode = Metacode.where('DOWNCASE(name) = ?', downcase(params[:name])).first if params[:name]
    set_metacode unless @metacode
    render json: @metacode
  end

  # POST /metacodes
  def create
    @metacode = Metacode.new(metacode_params)
    if @metacode.save
      render json: @metacode, status: :created
    else
      render json: @metacode.errors, status: :unprocessable_entity
    end
  end

  # PUT /metacodes/1
  def update
    if @metacode.update(metacode_params)
      head :no_content
    else
      render json: @metacode.errors, status: :unprocessable_entity
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
