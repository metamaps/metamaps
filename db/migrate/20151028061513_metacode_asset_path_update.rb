class MetacodeAssetPathUpdate < ActiveRecord::Migration
  def change
    Metacode.all.each do |metacode|
      if metacode.icon.start_with?("/assets/icons/")
        metacode.update(icon: metacode.icon.gsub(/^\/assets\/icons/, "https://s3.amazonaws.com/metamaps-assets/metacodes"))
      end
    end
  end
end
