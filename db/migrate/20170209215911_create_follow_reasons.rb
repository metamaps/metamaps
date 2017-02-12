class CreateFollowReasons < ActiveRecord::Migration[5.0]
  def change
    create_table :follow_reasons do |t|
      t.references  :follow, index: true
      t.boolean     :created
      t.boolean     :contributed
      t.boolean     :commented
      t.boolean     :followed
      t.boolean     :shared_on
      t.boolean     :starred
      t.timestamps
    end
  end
end
