module UsersHelper

   ## this one is for building our custom JSON autocomplete format for typeahead
  def autocomplete_user_array_json(users)
    temp = []
    users.each do |u|
      user = {}
      user['id'] = u.id
      user['label'] = u.name
      user['value'] = u.name
      user['profile'] = u.image.url(:sixtyfour)
      user['mapCount'] = u.maps.count
      user['generation'] = u.generation
      user['created_at'] = u.created_at.strftime("%m/%d/%Y")
      user['rtype'] = "mapper"
      
      temp.push user
    end
    return temp
  end
  
end
