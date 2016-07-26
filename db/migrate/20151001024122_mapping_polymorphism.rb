class MappingPolymorphism < ActiveRecord::Migration
  def up
    add_column :mappings, :mappable_id, :integer
    add_column :mappings, :mappable_type, :string
    add_index :mappings, [:mappable_id, :mappable_type]

    Mapping.find_each do |mapping|
      if mapping.synapse_id.nil? && mapping.topic_id.nil?
        puts "Mapping id=#{mapping.id} has no valid id, skipping!"
        next
      end
      if !mapping.synapse_id.nil? && !mapping.topic_id.nil?
        puts "Mapping id=#{mapping.id} has both topic and synapse ids, skipping!"
        next
      end

      if mapping.synapse_id.nil?
        mapping.mappable = Topic.find_by(id: mapping.topic_id)
      else
        mapping.mappable = Synapse.find_by(id: mapping.synapse_id)
      end

      if mapping.mappable.nil?
        mapping.delete
      else
        mapping.save
      end
    end
  end

  def down
    remove_index :mappings, [:mappable_id, :mappable_type]
    remove_column :mappings, :mappable_id, :integer
    remove_column :mappings, :mappable_type, :string
  end
end
