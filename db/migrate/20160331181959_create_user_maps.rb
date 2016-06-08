class CreateUserMaps < ActiveRecord::Migration
  def change
    create_table :user_maps do |t|
      t.references :user, index: true
      t.references :map,  index: true

      t.timestamps
    end
  end
end
