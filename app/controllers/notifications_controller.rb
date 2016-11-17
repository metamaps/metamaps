class NotificationsController < ApplicationController
  def index
    @notifications = current_user.mailbox.notifications

    respond_to do |format|
      format.html
      format.json { render json: @notifications.to_json }
    end
  end

  def show
    @notification = current_user.mailbox.notifications.find_by(id: params[:id])

    respond_to do |format|
      format.html
      format.json { render json: @notification.to_json }
    end
  end
end
