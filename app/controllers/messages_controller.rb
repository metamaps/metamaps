class MessagesController < ApplicationController
  before_action :require_user, except: [:show]
  after_action :verify_authorized

  # GET /messages/1.json
  def show
    @message = Message.find(params[:id])
    authorize @message

    respond_to do |format|
      format.json { render json: @message }
    end
  end

  # POST /messages
  # POST /messages.json
  def create
    @message = Message.new(message_params)
    @message.user = current_user
    authorize @message

    respond_to do |format|
      if @message.save
        format.json { render json: @message, status: :created, location: messages_url }
      else
        format.json { render json: @message.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /messages/1
  # PUT /messages/1.json
  def update
    @message = Message.find(params[:id])
    authorize @message

    respond_to do |format|
      if @message.update_attributes(message_params)
        format.json { head :no_content }
      else
        format.json { render json: @message.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /messages/1
  # DELETE /messages/1.json
  def destroy
    @message = Message.find(params[:id])
    authorize @message

    @message.destroy

    respond_to do |format|
      format.json { head :no_content }
    end
  end

  private

  # Never trust parameters from the scary internet, only allow the white list through.
  def message_params
    # params.require(:message).permit(:id, :resource_id, :message)
    params.permit(:id, :resource_id, :resource_type, :message)
  end
end
