class CreateGroupgroups < ActiveRecord::Migration
  def change
    create_table :groupgroups do |t|
      t.integer :group_id
      t.integer :parent_group_id

      t.timestamps
    end
  end
end
