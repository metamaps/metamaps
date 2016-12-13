# frozen_string_literal: true
class NotificationService
  def self.renderer
    renderer ||= ApplicationController.renderer.new(
      http_host: ENV['MAILER_DEFAULT_URL'],
      https:     Rails.env.production? ? true : false
    )
  end

  def self.access_request(request)
    body = renderer.render(template: 'map_mailer/access_request_email', locals: { map: request.map, request: request }, layout: false)
    request.map.user.notify(request.requested_text, body, request, false, MAILBOXER_CODE_ACCESS_REQUEST)
  end

  def self.access_approved(request)
    body = renderer.render(template: 'map_mailer/access_approved_email', locals: { map: request.map }, layout: false)
    receipt = request.user.notify(request.approved_text, body, request, false, MAILBOXER_CODE_ACCESS_APPROVED)
  end

  def self.invite_to_edit(map, inviter, invited)
    user_map = UserMap.find_by(user: invited, map: map)
    body = renderer.render(template: 'map_mailer/invite_to_edit_email', locals: { map: map, inviter: inviter }, layout: false)
    invited.notify(map.invited_text, body, user_map, false, MAILBOXER_CODE_INVITE_TO_EDIT)
  end
end
