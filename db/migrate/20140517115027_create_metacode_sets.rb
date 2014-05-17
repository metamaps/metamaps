class CreateMetacodeSets < ActiveRecord::Migration
  def change
    create_table :metacode_sets do |t|
      t.string :name
      t.text :desc
      t.references :user
      t.boolean :mapperContributed

      t.timestamps
    end
    add_index :metacode_sets, :user_id
  end
end
