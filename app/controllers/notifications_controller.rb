# frozen_string_literal: true
class NotificationsController < ApplicationController
  before_action :set_receipts, only: [:index, :show, :mark_read, :mark_unread]
  before_action :set_notification, only: [:show, :mark_read, :mark_unread]
  before_action :set_receipt, only: [:show, :mark_read, :mark_unread]

  def index
    @notifications = current_user.mailbox.notifications

    respond_to do |format|
      format.html
      format.json do
        render json: @notifications.map do |notification|
          receipt = @receipts.find_by(notification_id: notification.id)
          notification.as_json.merge(is_read: receipt.is_read)
        end
      end
    end
  end

  def show
    @receipt.update(is_read: true)
    respond_to do |format|
      format.html
      format.json do
        render json: @notification.as_json.merge(
          is_read: @receipt.is_read
        )
      end
    end
  end

  def mark_read
    @receipt.update(is_read: true)
    respond_to do |format|
      format.js
      format.json do
        render json: @notification.as_json.merge(
          is_read: @receipt.is_read
        )
      end
    end
  end

  def mark_unread
    @receipt.update(is_read: false)
    respond_to do |format|
      format.js
      format.json do
        render json: @notification.as_json.merge(
          is_read: @receipt.is_read
        )
      end
    end
  end

  def unsubscribe
    # TODO will a logged out user be unsubscribed after logging in?
    # need to use devise stored_url or whatever
    if current_user.nil?
      flash[:notice] = 'Continue to unsubscribe from emails by logging in.'
      return redirect_to "#{sign_in_path}?redirect_to=#{unsubscribe_notifications_path}"
    end

    if current_user.emails_allowed == false
      return redirect_to edit_user_path(current_user), notice: 'You were already unsubscribed from emails.'
    end

    current_user.emails_allowed = false
    success = current_user.save

    if success
      redirect_to edit_user_path(current_user), notice: 'You will no longer receive emails from Metamaps.'
    else
      flash[:alert] = 'Sorry, something went wrong. You have not been unsubscribed from emails.'
      redirect_to edit_user_path(current_user)
    end
  end

  private

  def set_receipts
    @receipts = current_user.mailboxer_notification_receipts
  end

  def set_notification
    @notification = current_user.mailbox.notifications.find_by(id: params[:id])
  end

  def set_receipt
    @receipt = @receipts.find_by(notification_id: params[:id])
  end
end
