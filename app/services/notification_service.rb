# frozen_string_literal: true
class NotificationService
  # for strip_tags
  include ActionView::Helpers::SanitizeHelper

  def self.renderer
    renderer ||= ApplicationController.renderer.new(
      http_host: ENV['MAILER_DEFAULT_URL'],
      https:     Rails.env.production? ? true : false
    )
  end

  def self.access_request(request)
    body = renderer.render(template: 'map_mailer/access_request_email', locals: { map: request.map, request: request }, layout: false)
    request.map.user.notify(request.requested_text, body, request, false, MAILBOXER_CODE_ACCESS_REQUEST, true, request.user)
  end

  def self.access_approved(request)
    body = renderer.render(template: 'map_mailer/access_approved_email', locals: { map: request.map }, layout: false)
    request.user.notify(request.approved_text, body, request, false, MAILBOXER_CODE_ACCESS_APPROVED, true, request.map.user)
  end

  def self.invite_to_edit(map, inviter, invited)
    user_map = UserMap.find_by(user: invited, map: map)
    body = renderer.render(template: 'map_mailer/invite_to_edit_email', locals: { map: map, inviter: inviter }, layout: false)
    invited.notify(map.invited_text, body, user_map, false, MAILBOXER_CODE_INVITE_TO_EDIT, true, inviter)
  end

  # note: this is a global function, probaobly called from the rails console with some html body
  def self.message_from_devs(subject, body, opts = {})
    users = opts[:users] || User.all
    obj = opts[:obj] || nil
    sanitize_text = opts[:sanitize_text] || false
    notification_code = opts[:notification_code] || MAILBOXER_CODE_MESSAGE_FROM_DEVS
    send_mail = opts[:send_mail] || true
    sender = opts[:sender] || User.find_by(email: 'ishanshapiro@gmail.com')
    Mailboxer::Notification.notify_all(users, subject, body, obj, sanitize_text, notification_code, send_mail, sender)
  end

  def self.text_for_notification(notification)
    if notification.notification_code == MAILBOXER_CODE_ACCESS_REQUEST
      map = notification.notified_object.map
      'wants permission to map with you on <span class="in-bold">' + map.name + '</span>&nbsp;&nbsp;<div class="action">Offer a response</div>'
    elsif notification.notification_code == MAILBOXER_CODE_ACCESS_APPROVED
      map = notification.notified_object.map
      'granted your request to edit map <span class="in-bold">' + map.name + '</span>'
    elsif notification.notification_code == MAILBOXER_CODE_INVITE_TO_EDIT
      map = notification.notified_object.map
      'gave you edit access to map  <span class="in-bold">' + map.name + '</span>'
    elsif notification.notification_code == MAILBOXER_CODE_MESSAGE_FROM_DEVS
      notification.subject
    end
  end
end
