class AddMutedToFollows < ActiveRecord::Migration[5.0]
  def change
    add_column :follows, :muted, :boolean 
  end
end
