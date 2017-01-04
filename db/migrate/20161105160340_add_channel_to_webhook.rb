class AddChannelToWebhook < ActiveRecord::Migration[5.0]
  def change
    add_column :webhooks, :channel, :string
  end
end
