# frozen_string_literal: true

class StarsController < ApplicationController
  before_action :require_user
  before_action :set_map
  after_action :verify_authorized

  # POST maps/:id/star
  def create
    authorize @map, :star?
    Star.find_or_create_by(map_id: @map.id, user_id: current_user.id)

    respond_to do |format|
      format.json do
        render json: { message: 'Successfully starred map' }
      end
    end
  end

  # POST maps/:id/unstar
  def destroy
    authorize @map, :unstar?
    star = Star.find_by(map_id: @map.id, user_id: current_user.id)
    star&.delete

    respond_to do |format|
      format.json do
        render json: { message: 'Successfully unstarred map' }
      end
    end
  end

  private

  def set_map
    @map = Map.find(params[:id])
  end
end
