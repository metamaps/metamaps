class AddAttachmentIconToMetacodes < ActiveRecord::Migration
  def change
    change_table :metacodes do |t|
      t.rename :icon, :manual_icon
      t.attachment :aws_icon
    end
  end
end
