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
      Events::NewMapping.publish!(@mapping, current_user)
    else
      render json: @mapping.errors, status: :unprocessable_entity
    end
  end

  # PUT /mappings/1.json
  def update
    @mapping = Mapping.find(params[:id])
    authorize @mapping

    if @mapping.update_attributes(mapping_params)
      head :no_content
    else
      render json: @mapping.errors, status: :unprocessable_entity
    end
  end

  # DELETE /mappings/1.json
  def destroy
    @mapping = Mapping.find(params[:id])
    authorize @mapping

    mappable = @mapping.mappable
    if mappable.defer_to_map
      mappable.permission = mappable.defer_to_map.permission
      mappable.defer_to_map_id = nil
      mappable.save
    end

    @mapping.destroy

    head :no_content 
  end

  private
    # Never trust parameters from the scary internet, only allow the white list through.
    def mapping_params
      params.require(:mapping).permit(:id, :xloc, :yloc, :mappable_id, :mappable_type, :map_id)
    end
end
