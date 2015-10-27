class MappingPolymorphism < ActiveRecord::Migration
  def up
    add_column :mappings, :mappable_id, :integer
    add_column :mappings, :mappable_type, :string
    add_index :mappings, [:mappable_id, :mappable_type]

    Mapping.find_each do |mapping|
      if mapping.synapse_id.nil? and mapping.topic_id.nil?
        puts "Mapping id=#{mapping.id} has no valid id, skipping!"
        next
      end
      if not mapping.synapse_id.nil? and not mapping.topic_id.nil?
        puts "Mapping id=#{mapping.id} has both topic and synapse ids, skipping!"
        next
      end

      unless mapping.synapse_id.nil?
        mapping.mappable = Synapse.find(mapping.synapse_id)
      else
        next if mapping.topic_id == 0
        mapping.mappable = Topic.find(mapping.topic_id)
      end
      mapping.save
    end
  end

  def down
    remove_index :mappings, [:mappable_id, :mappable_type]
    remove_column :mappings, :mappable_id, :integer
    remove_column :mappings, :mappable_type, :string
  end
end
