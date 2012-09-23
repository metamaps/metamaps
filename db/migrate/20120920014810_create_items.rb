class CreateItems < ActiveRecord::Migration
  def change
    create_table :items do |t|
      t.text :name
      t.text :desc
      t.text :link
	  t.integer :user_id
	  t.integer :person_id
	  t.integer :group_id
	  t.integer :item_category_id

      t.timestamps
    end
  end
end
