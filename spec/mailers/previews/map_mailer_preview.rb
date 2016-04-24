# Preview all emails at http://localhost:3000/rails/mailers/map_mailer
class MapMailerPreview < ActionMailer::Preview
  def invite_to_edit_email
    MapMailer.invite_to_edit_email(Map.first, User.first, User.second)
  end
end
