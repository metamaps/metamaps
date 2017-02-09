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

  def self.get_template_for_event_type(event_type)
    'map_mailer/' + event_type
  end
  
  def self.get_mailboxer_code_for_event_type(event_type)
    case event_type
      when 'access_approved'
        MAILBOXER_CODE_ACCESS_APPROVED
      when 'access_request'
        MAILBOXER_CODE_ACCESS_REQUEST
      when 'invite_to_edit'
        MAILBOXER_CODE_INVITE_TO_EDIT
    end
  end

  def self.access_request(request)
    event_type = 'access_request'
    template = get_template_for_event_type(event_type)
    mailboxer_code = get_mailboxer_code_for_event_type(event_type)
    body = renderer.render(template: template, locals: { map: request.map, request: request }, layout: false)
    request.map.user.notify(request.requested_text, body, request, false, mailboxer_code, true, request.user)
  end

  def self.access_approved(request)
    event_type = 'access_approved'
    template = get_template_for_event_type(event_type)
    mailboxer_code = get_mailboxer_code_for_event_type(event_type)
    body = renderer.render(template: template, locals: { map: request.map }, layout: false)
    request.user.notify(request.approved_text, body, request, false, mailboxer_code, true, request.map.user)
  end

  def self.invite_to_edit(user_map)
    event_type = 'invite_to_edit'
    template = get_template_for_event_type(event_type)
    mailboxer_code = get_mailboxer_code_for_event_type(event_type)
    body = renderer.render(template: template, locals: { map: user_map.map, inviter: user_map.map.user }, layout: false)
    user_map.user.notify(map.invited_text, body, user_map, false, mailboxer_code, true, user_map.map.user)
  end

  # note: this is a global function, probably called from the rails console with some html body
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
    case notification.notification_code
      when MAILBOXER_CODE_ACCESS_APPROVED
        map = notification.notified_object.map
        'granted your request to edit map <span class="in-bold">' + map.name + '</span>'
      when MAILBOXER_CODE_ACCESS_REQUEST
        map = notification.notified_object.map
        'wants permission to map with you on <span class="in-bold">' + map.name + '</span>&nbsp;&nbsp;<div class="action">Offer a response</div>'
      when MAILBOXER_CODE_INVITE_TO_EDIT
        map = notification.notified_object.map
        'gave you edit access to map  <span class="in-bold">' + map.name + '</span>'
      when MAILBOXER_CODE_MESSAGE_FROM_DEVS
        notification.subject
    end
  end
end
