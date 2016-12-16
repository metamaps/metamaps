class AddEmailsAllowedToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :emails_allowed, :boolean, default: true
  end
end
