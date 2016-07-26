class AddGenerationToUsers < ActiveRecord::Migration
  def change
    add_column :users, :generation, :integer
  end
end
