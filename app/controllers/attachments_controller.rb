# frozen_string_literal: true

class AttachmentsController < ApplicationController
  before_action :set_attachment, only: [:destroy]
  after_action :verify_authorized

  def create
    @attachment = Attachment.new(attachment_params)
    authorize @attachment

    respond_to do |format|
      if @attachment.save
        format.json { render json: @attachment, status: :created }
      else
        format.json { render json: @attachment.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @attachment.destroy
    respond_to do |format|
      format.json { head :no_content }
    end
  end

  private

  def set_attachment
    @attachment = Attachment.find(params[:id])
    authorize @attachment
  end

  def attachment_params
    params.require(:attachment).permit(:id, :file, :attachable_id, :attachable_type)
  end
end
