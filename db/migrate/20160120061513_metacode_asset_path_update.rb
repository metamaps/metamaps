class Metacode < ActiveRecord::Base
end

class MetacodeAssetPathUpdate < ActiveRecord::Migration
  def change
    Metacode.first(50).each do |metacode|
      if metacode.icon.start_with?("/assets/icons/")
        metacode.icon = metacode.icon.sub(/^\/assets\/icons/, "https://s3.amazonaws.com/metamaps-assets/metacodes")
        metacode.icon = metacode.icon.sub('blueprint_96px', 'blueprint/96px')
        metacode.icon = metacode.icon.sub('generics_96px', 'generics/96px')
        metacode.save
      end
    end
  end
end
