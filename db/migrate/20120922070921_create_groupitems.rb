class CreateGroupitems < ActiveRecord::Migration
  def change
    create_table :groupitems do |t|
      t.integer :group_id
      t.integer :item_id

      t.timestamps
    end
  end
end
