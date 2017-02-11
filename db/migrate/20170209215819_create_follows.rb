class CreateFollows < ActiveRecord::Migration[5.0]
  def change
    create_table :follows do |t|
      t.references  :user, index: true
      t.references  :followed, polymorphic: true, index: true
      t.timestamps
    end
  end
end
