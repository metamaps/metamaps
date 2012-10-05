class CreateSynapses < ActiveRecord::Migration
  def change
    create_table :synapses do |t|
      t.text :desc
	  t.text :category
	  t.integer :node1_id
	  t.integer :node2_id
	  t.integer :user_id

      t.timestamps
    end
  end
end
