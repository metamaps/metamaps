module UsersHelper
  # build custom json autocomplete for typeahead
  def autocomplete_user_array_json(users)
    json_users = []
    users.each do |user|
     json_users.push user.as_json_for_autocomplete
    end
    json_users
  end
end
