# frozen_string_literal: true
class MapMailer < ApplicationMailer
  include MapMailerHelper
  default from: 'team@metamaps.cc'

  def access_approved(request)
    @request = request
    @map = request.map
    mail(to: request.user.email, subject: access_approved_subject(@map))
  end

  def access_request(request)
    @request = request
    @map = request.map
    mail(to: @map.user.email, subject: access_request_subject(@map))
  end

  def invite_to_edit(user_map)
    @inviter = user_map.map.user
    @map = user_map.map
    mail(to: user_map.user.email, subject: invite_to_edit_subject(@map))
  end
end
