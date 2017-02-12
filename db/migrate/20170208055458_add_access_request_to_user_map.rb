class AddAccessRequestToUserMap < ActiveRecord::Migration[5.0]
  def change
    add_reference :user_maps, :access_request
  end
end
