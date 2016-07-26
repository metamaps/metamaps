class MapMailer < ApplicationMailer
  default from: 'team@metamaps.cc'

  def invite_to_edit_email(map, inviter, invitee)
    @inviter = inviter
    @map = map
    subject = @map.name + ' - Invitation to edit'
    mail(to: invitee.email, subject: subject)
  end
end
