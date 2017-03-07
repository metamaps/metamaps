# frozen_string_literal: true
class MapActivityMailer < ApplicationMailer
  default from: 'team@metamaps.cc'

  def daily_summary(user, map, summary_data)
    @user = user
    @map = map
    @summary_data = summary_data
    mail(to: user.email, subject: MapActivityService.subject_line(map))
  end
end
