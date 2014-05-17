class CreateInMetacodeSets < ActiveRecord::Migration
  def change
    create_table :in_metacode_sets do |t|
      t.references :metacode
      t.references :metacode_set

      t.timestamps
    end
    add_index :in_metacode_sets, :metacode_id
    add_index :in_metacode_sets, :metacode_set_id
  end
end
