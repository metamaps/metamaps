class RemoveAssetPathsFromMetacodes < ActiveRecord::Migration
  def change
    Metacode.all.each do |metacode|
      metacode.icon = metacode.icon.gsub(/^\/assets\//, '')
      metacode.save
    end
  end
end
