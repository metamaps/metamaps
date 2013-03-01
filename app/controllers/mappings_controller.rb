class MappingsController < ApplicationController
  # GET mappings
  def index
  end

  # GET mappings/new
  def new
    @mapping = Mapping.new
    @user = current_user
    respond_with(@mapping)
  end

  # POST mappings
  def create
    @user = current_user
    @mapping = Mapping.new()
    @mapping.user = @user
    if params[:map]
      if params[:map][:id]
        @map = Map.find(params[:map][:id])
        @mapping.map = @map
      end
    end
    if params[:topic]
      if params[:topic][:id]
        @topic = Topic.find(params[:topic][:id])
        @mapping.topic = @topic
      end
    elsif params[:synapse]
      if params[:synapse][:id]
        @topic = Synapse.find(params[:synapse][:id])
        @mapping.synapse = @synapse
      end
    end
  end

  # GET /mappings/:id
  def show
  end

  # GET /mappings/:id/edit
  def edit
  end

  # PUT /mappings/:id
  def update
  end

  # DELETE /mappings/:id
  def destroy
  end
end
