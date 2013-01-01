class CreateMetacodes < ActiveRecord::Migration
  def change
    create_table :metacodes do |t|
      t.text :name
      t.string :icon
      
      t.timestamps
    end
  end
end
