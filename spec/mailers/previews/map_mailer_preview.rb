# frozen_string_literal: true
# Preview all emails at http://localhost:3000/rails/mailers/map_mailer
class MapMailerPreview < ActionMailer::Preview
  def invite_to_edit
    user_map = UserMap.first
    MapMailer.invite_to_edit(user_map)
  end

  def access_request_email
    request = AccessRequest.first
    MapMailer.access_request(request)
  end

  def access_approved_email
    request = AccessRequest.first
    MapMailer.access_approved(request)
  end
end
