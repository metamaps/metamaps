# frozen_string_literal: true
module ApplicationHelper
  def invite_link
    "#{request.base_url}/join" + (current_user ? "?code=#{current_user.code}" : '')
  end

  def user_unread_notification_count
    return 0 if current_user.nil?
    @uunc ||= current_user.mailboxer_notification_receipts.reduce(0) do |total, receipt|
      receipt.is_read ? total : total + 1
    end
  end
end
