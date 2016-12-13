# frozen_string_literal: true
class MapMailer < ApplicationMailer
  default from: 'team@metamaps.cc'

  def access_request_email(request)
    @request = request
    @map = request.map
    mail(to: @map.user.email, subject: request.requested_text)
  end

  def access_approved_email(request)
    @request = request
    @map = request.map
    mail(to: request.user, subject: request.approved_text)
  end

  def invite_to_edit_email(map, inviter, invitee)
    @inviter = inviter
    @map = map
    mail(to: invitee.email, subject: map.invited_text)
  end
end
