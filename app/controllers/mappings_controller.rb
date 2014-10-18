class MappingsController < ApplicationController
      
  respond_to :json
    
  # GET /mappings/1.json
  def show
    @mapping = Mapping.find(params[:id])

    render json: @mapping
  end

  # POST /mappings.json
  def create
    @mapping = Mapping.new(params[:mapping])

    @mapping.map.touch(:updated_at)

    if @mapping.save
      render json: @mapping, status: :created
    else
      render json: @mapping.errors, status: :unprocessable_entity
    end
  end

  # PUT /mappings/1.json
  def update
    @mapping = Mapping.find(params[:id])

    @mapping.map.touch(:updated_at)

    if @mapping.update_attributes(params[:mapping])
      head :no_content
    else
      render json: @mapping.errors, status: :unprocessable_entity
    end
  end

  # DELETE /mappings/1.json
  def destroy
    @mapping = Mapping.find(params[:id])
    @map = @mapping.map

    @mapping.destroy

    @map.touch(:updated_at)

    head :no_content 
  end
end
