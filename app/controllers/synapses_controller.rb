class SynapsesController < ApplicationController
  include TopicsHelper

  before_filter :require_user, only: [:create, :update, :destroy]
    
  respond_to :json
  
  # GET /synapses/1.json
  def show
    @synapse = Synapse.find(params[:id])

    #.authorize_to_show(@current)
	
    #if not @synapse
    #  redirect_to root_url and return
    #end
      
    render json: @synapse
  end
  
  # POST /synapses
  # POST /synapses.json
  def create
    @synapse = Synapse.new(params[:synapse])

    respond_to do |format|
      if @synapse.save
        format.json { render json: @synapse, status: :created }
      else
        format.json { render json: @synapse.errors, status: :unprocessable_entity }
      end
    end
  end
  
  # PUT /synapses/1
  # PUT /synapses/1.json
  def update
    @synapse = Synapse.find(params[:id])

    respond_to do |format|
      if @synapse.update_attributes(params[:synapse])
        format.json { head :no_content }
      else
        format.json { render json: @synapse.errors, status: :unprocessable_entity }
      end
    end
  end
  
  # DELETE synapses/:id
  def destroy
    @current = current_user
    @synapse = Synapse.find(params[:id]).authorize_to_delete(@current)

    if @synapse
      @synapse.mappings.each do |m|
        m.map.touch(:updated_at)
        m.delete
      end

      @synapse.delete
    end
      
    respond_to do |format|
      format.json { head :no_content }
    end
  end
end
