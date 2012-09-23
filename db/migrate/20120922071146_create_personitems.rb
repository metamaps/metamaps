class CreatePersonitems < ActiveRecord::Migration
  def change
    create_table :personitems do |t|
      t.integer :person_id
      t.integer :item_id

      t.timestamps
    end
  end
end
