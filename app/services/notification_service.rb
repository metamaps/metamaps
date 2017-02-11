# frozen_string_literal: true
class NotificationService
  extend TopicMailerHelper
  extend MapMailerHelper
  # for strip_tags
  include ActionView::Helpers::SanitizeHelper

  def self.renderer
    renderer ||= ApplicationController.renderer.new(
      http_host: ENV['MAILER_DEFAULT_URL'],
      https:     Rails.env.production? ? true : false
    )
  end

  def self.get_settings_for_event(entity, event_type, event)
    case event_type
      when TOPIC_ADDED_TO_MAP
        subject = added_to_map_subject(entity, event.map)
        template = 'topic_mailer/added_to_map'
      when TOPIC_CONNECTED_1
        subject = connected_subject(event.topic1)
        template = 'topic_mailer/connected'
      when TOPIC_CONNECTED_2
        subject = connected_subject(event.topic2)
        template = 'topic_mailer/connected'
    end
    
    {template: template, subject: subject}
  end

  def self.send_for_follows(follows, entity, event_type, event)
    return if follows.length == 0
    settings = get_settings_for_event(entity, event_type, event)
    # we'll prbly want to put the body into the actual loop so we can pass the current user in as a local
    body = renderer.render(template: settings[:template], locals: { entity: entity, event: event }, layout: false)
    follows.each{|follow|
      # this handles email and in-app notifications, in the future, include push
      follow.user.notify(settings[:subject], body, event, false, event_type, (follow.user.emails_allowed && follow.email), event.user)
      # push could be handled with Actioncable to send transient notifications to the UI
      # the receipt from the notify call could be used to link to the full notification
    }
  end

  def self.notify_followers(entity, event_type, event, reason_filter = nil, exclude_follows = nil)
    follows = entity.follows.where.not(user_id: event.user.id)
    
    if !exclude_follows.nil?
      follows = follows.where.not(id: exclude_follows)
    end
    
    if reason_filter.class == String && FollowReason::REASONS.include?(reason_filter)
      follows = follows.joins(:follow_reason).where('follow_reasons.' + reason_filter => true)
    elsif reason_filter.class == Array
      # TODO: throw an error here if all the reasons aren't valid
      follows = follows.joins(:follow_reason).where(reason_filter.map{|r| "follow_reasons.#{r} = 't'"}.join(' OR '))
    end
    send_for_follows(follows, entity, event_type, event)
    return follows.map(&:id)
  end

  def self.access_request(request)
    subject = access_request_subject(request.map)
    body = renderer.render(template: 'map_mailer/access_request', locals: { map: request.map, request: request }, layout: false)
    request.map.user.notify(subject, body, request, false, MAP_ACCESS_REQUEST, true, request.user)
  end

  def self.access_approved(request)
    subject = access_approved_subject(request.map)
    body = renderer.render(template: 'map_mailer/access_approved', locals: { map: request.map }, layout: false)
    request.user.notify(subject, body, request, false, MAP_ACCESS_APPROVED, true, request.map.user)
  end

  def self.invite_to_edit(user_map)
    subject = invite_to_edit_subject(user_map.map)
    body = renderer.render(template: 'map_mailer/invite_to_edit', locals: { map: user_map.map, inviter: user_map.map.user }, layout: false)
    user_map.user.notify(subject, body, user_map, false, MAP_INVITE_TO_EDIT, true, user_map.map.user)
  end

  # note: this is a global function, probably called from the rails console with some html body
  def self.message_from_devs(subject, body, opts = {})
    users = opts[:users] || User.all
    obj = opts[:obj] || nil
    sanitize_text = opts[:sanitize_text] || false
    notification_code = opts[:notification_code] || MESSAGE_FROM_DEVS
    send_mail = opts[:send_mail] || true
    sender = opts[:sender] || User.find_by(email: 'ishanshapiro@gmail.com')
    Mailboxer::Notification.notify_all(users, subject, body, obj, sanitize_text, notification_code, send_mail, sender)
  end
end
