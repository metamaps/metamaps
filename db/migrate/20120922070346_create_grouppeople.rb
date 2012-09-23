class CreateGrouppeople < ActiveRecord::Migration
  def change
    create_table :grouppeople do |t|
      t.integer :group_id
      t.integer :person_id

      t.timestamps
    end
  end
end
