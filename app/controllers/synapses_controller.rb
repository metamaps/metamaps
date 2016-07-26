class SynapsesController < ApplicationController
  include TopicsHelper

  before_action :require_user, only: [:create, :update, :destroy]
  after_action :verify_authorized, except: :index
  after_action :verify_policy_scoped, only: :index

  respond_to :json

  # GET /synapses/1.json
  def show
    @synapse = Synapse.find(params[:id])
    authorize @synapse

    render json: @synapse
  end

  # POST /synapses
  # POST /synapses.json
  def create
    @synapse = Synapse.new(synapse_params)
    @synapse.desc = '' if @synapse.desc.nil?
    authorize @synapse

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
    @synapse.desc = '' if @synapse.desc.nil?
    authorize @synapse

    respond_to do |format|
      if @synapse.update_attributes(synapse_params)
        format.json { head :no_content }
      else
        format.json { render json: @synapse.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE synapses/:id
  def destroy
    @synapse = Synapse.find(params[:id])
    authorize @synapse
    @synapse.destroy

    respond_to do |format|
      format.json { head :no_content }
    end
  end

  private

  def synapse_params
    params.require(:synapse).permit(:id, :desc, :category, :weight, :permission, :node1_id, :node2_id, :user_id)
  end
end
