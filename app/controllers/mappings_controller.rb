# frozen_string_literal: true
class MappingsController < ApplicationController
  before_action :require_user, only: [:create, :update, :destroy]
  after_action :verify_authorized, except: :index
  after_action :verify_policy_scoped, only: :index

  respond_to :json

  # GET /mappings/1.json
  def show
    @mapping = Mapping.find(params[:id])
    authorize @mapping

    render json: @mapping
  end

  # POST /mappings.json
  def create
    @mapping = Mapping.new(mapping_params)
    authorize @mapping
    @mapping.user = current_user

    if @mapping.save
      render json: @mapping, status: :created
    else
      render json: @mapping.errors, status: :unprocessable_entity
    end
  end

  # PUT /mappings/1.json
  def update
    @mapping = Mapping.find(params[:id])
    authorize @mapping
    # hack: set the user temporarily so that the model hook can reference it, and then set it back
    temp = @mapping.user 
    @mapping.user = current_user
    @mapping.assign_attributes(mapping_params)

    if @mapping.save
      head :no_content
    else
      render json: @mapping.errors, status: :unprocessable_entity
    end
    # restore the original mapping creator
    @mapping.user = temp
    @mapping.save
  end

  # DELETE /mappings/1.json
  def destroy
    @mapping = Mapping.find(params[:id])
    authorize @mapping
    # hack: set the user temporarily so that the model hook can reference this user who is taking the action
    @mapping.user = current_user
    @mapping.destroy

    head :no_content
  end

  private

  # Never trust parameters from the scary internet, only allow the white list through.
  def mapping_params
    params.require(:mapping).permit(:id, :xloc, :yloc, :mappable_id, :mappable_type, :map_id)
  end
end
