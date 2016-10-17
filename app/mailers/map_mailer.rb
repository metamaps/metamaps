# frozen_string_literal: true
class MapMailer < ApplicationMailer
  default from: 'team@metamaps.cc'

  def access_request_email(request, map)
    @request = request
    @map = map
    subject = @map.name + ' - request to edit'
    mail(to: @map.user.email, subject: subject)
  end

  def invite_to_edit_email(map, inviter, invitee)
    @inviter = inviter
    @map = map
    subject = @map.name + ' - invitation to edit'
    mail(to: invitee.email, subject: subject)
  end
end
