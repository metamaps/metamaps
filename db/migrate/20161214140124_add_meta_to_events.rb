class AddMetaToEvents < ActiveRecord::Migration[5.0]
  def change
    add_column :events, :meta, :json
  end
end
