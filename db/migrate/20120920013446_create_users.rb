class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :name
      t.string :email
	    t.string :code, :limit => 8
	    t.string :joinedwithcode, :limit => 8
      t.string :crypted_password
      t.string :password_salt
      t.string :persistence_token
      t.string :perishable_token

      t.timestamps
    end
  end
end
