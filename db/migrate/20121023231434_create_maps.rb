class CreateMaps < ActiveRecord::Migration
  def change
    create_table :maps do |t|

      t.timestamps
    end
  end
end
