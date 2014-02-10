class AddAdminToUsers < ActiveRecord::Migration
  def change
    add_column :users, :admin, :boolean
    User.reset_column_information
    User.update_all(:admin => false)
  end
end
