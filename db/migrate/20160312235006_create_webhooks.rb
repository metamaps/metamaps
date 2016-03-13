class CreateWebhooks < ActiveRecord::Migration
  def change
    create_table :webhooks do |t|
      t.references :hookable, polymorphic: true, index: true
      t.string :kind, null: false
      t.string :uri, null: false
      t.text   :event_types, array: true, default: []
    end
  end
end
