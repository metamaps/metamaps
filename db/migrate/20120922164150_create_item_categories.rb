class CreateItemCategories < ActiveRecord::Migration
  def change
    create_table :item_categories do |t|
      t.text :name
      t.string :icon

      t.timestamps
    end
  end
end
