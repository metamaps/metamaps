class CreateMaps < ActiveRecord::Migration
  def change
    create_table :maps do |t|
      t.text :name
      t.text :desc
	  t.text :permission
	  t.integer :user_id
      t.timestamps
    end
  end
end
