class Star < ActiveRecord::Migration
  def change
    create_table :stars do |t|
      t.references :user, index: true 
      t.references :map, index: true
      t.timestamps
    end
  end
end
