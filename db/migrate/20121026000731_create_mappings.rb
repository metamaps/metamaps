class CreateMappings < ActiveRecord::Migration
  def change
    create_table :mappings do |t|
      t.text :category
	    t.integer :xloc
      t.integer :yloc
	    t.integer :topic_id
	    t.integer :synapse_id
	    t.integer :map_id
	    t.integer :user_id
      t.timestamps
    end
  end
end
