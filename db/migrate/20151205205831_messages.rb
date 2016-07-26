class Messages < ActiveRecord::Migration
  def change
    create_table :messages do |t|
      t.text :message
      t.references :user
      t.integer :resource_id
      t.string :resource_type

      t.timestamps
    end
    add_index :messages, :user_id
    add_index :messages, :resource_id
    add_index :messages, :resource_type
  end
end
