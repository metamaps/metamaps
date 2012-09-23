class CreateItemitems < ActiveRecord::Migration
  def change
    create_table :itemitems do |t|
      t.integer :item_id
      t.integer :parent_item_id

      t.timestamps
    end
  end
end
