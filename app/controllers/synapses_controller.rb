# frozen_string_literal: true

class SynapsesController < ApplicationController
  include TopicsHelper

  before_action :require_user, only: %i(create update destroy)
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
    @synapse.desc.strip! # no trailing/leading whitespace
    @synapse.user = current_user
    @synapse.updated_by = current_user

    # we want invalid params to return :unprocessable_entity
    # so we have to authorize AFTER saving. But if authorize
    # fails, we need to rollback the SQL transaction
    success = nil
    ActiveRecord::Base.transaction do
      success = @synapse.save
      success ? authorize(@synapse) : skip_authorization
    end

    respond_to do |format|
      if success
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
    @synapse.updated_by = current_user
    @synapse.assign_attributes(synapse_params)

    respond_to do |format|
      if @synapse.save
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
    @synapse.updated_by = current_user
    @synapse.destroy

    respond_to do |format|
      format.json { head :no_content }
    end
  end

  private

  def synapse_params
    params.require(:synapse).permit(
      :id, :desc, :category, :weight, :permission, :topic1_id, :topic2_id
    )
  end
end
