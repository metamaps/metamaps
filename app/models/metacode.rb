class Metacode < ActiveRecord::Base

  has_many :in_metacode_sets
  has_many :metacode_sets, :through => :in_metacode_sets 
  has_many :topics

  def hasSelected(user)
    return true if user.settings.metacodes.include? self.id.to_s
    return false
  end
    
  def inMetacodeSet(metacode_set)
    return true if self.metacode_sets.include? metacode_set
    return false
  end

  def asset_path_icon
    if icon.start_with?('http')
      icon
    else
      ActionController::Base.helpers.asset_path icon
    end
  end

  #output json with asset_paths merged in
  def as_json(options)
    json = super(options.merge!(methods: :asset_path_icon))
    json["icon"] = json["asset_path_icon"]
    json.except("asset_path_icon")
  end
end
