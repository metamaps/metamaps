module MapMailerHelper
  def access_approved_subject(map)
    map.name + ' - access approved'
  end

  def access_request_subject(map)
    map.name + ' - request to edit'
  end  

  def invite_to_edit_subject(map)
    map.name + ' - invited to edit'
  end
end