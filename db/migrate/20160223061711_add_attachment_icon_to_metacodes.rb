class AddAttachmentIconToMetacodes < ActiveRecord::Migration
  def change
    change_table :metacodes do |t|
      t.rename :icon, :old_icon
      t.attachment :icon
    end
  end
end
