class CreateTopics < ActiveRecord::Migration
  def change
    create_table :topics do |t|
      t.text :name
      t.text :desc
      t.text :link
	    t.text :permission
	    t.integer :user_id
	    t.integer :metacode_id
      t.timestamps
    end
  end
end
