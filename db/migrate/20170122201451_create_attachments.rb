class CreateAttachments < ActiveRecord::Migration[5.0]
  def change
    create_table :attachments do |t|
      t.references :attachable, polymorphic: true
      t.attachment :file
      t.timestamps
    end

    remove_attachment :topics, :image
    remove_attachment :topics, :audio
  end
end
