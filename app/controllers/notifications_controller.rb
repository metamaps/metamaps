# frozen_string_literal: true
class NotificationsController < ApplicationController
  before_action :set_receipts, only: [:index, :show, :mark_read, :mark_unread]
  before_action :set_notification, only: [:show, :mark_read, :mark_unread]
  before_action :set_receipt, only: [:show, :mark_read, :mark_unread]

  def index
    @notifications = current_user.mailbox.notifications.page(params[:page]).per(25)

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
      format.html do
        case @notification.notification_code
          when MAP_ACCESS_APPROVED, MAP_INVITE_TO_EDIT
            redirect_to map_path(@notification.notified_object.map)
          when TOPIC_ADDED_TO_MAP
            redirect_to map_path(@notification.notified_object.map)
          when TOPIC_CONNECTED_1
            redirect_to topic_path(@notification.notified_object.topic1)
          when TOPIC_CONNECTED_2
            redirect_to topic_path(@notification.notified_object.topic2)
        end
      end
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
    unsubscribe_redirect_if_logged_out!
    check_if_already_unsubscribed!
    return if performed? # if one of these checks already redirected, we're done

    if current_user.update(emails_allowed: false)
      redirect_to edit_user_path(current_user),
                  notice: 'You will no longer receive emails from Metamaps.'
    else
      flash[:alert] = 'Sorry, something went wrong. You have not been unsubscribed from emails.'
      redirect_to edit_user_path(current_user)
    end
  end

  private

  def unsubscribe_redirect_if_logged_out!
    return if current_user.present?

    flash[:notice] = 'Continue to unsubscribe from emails by logging in.'
    redirect_to "#{sign_in_path}?redirect_to=#{unsubscribe_notifications_path}"
  end

  def check_if_already_unsubscribed!
    return if current_user.emails_allowed

    redirect_to edit_user_path(current_user), notice: 'You were already unsubscribed from emails.'
  end

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
