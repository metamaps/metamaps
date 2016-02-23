class Metacode < ActiveRecord::Base
  has_many :in_metacode_sets
  has_many :metacode_sets, :through => :in_metacode_sets 
  has_many :topics

  # This method associates the attribute ":icon" with a file attachment
  has_attached_file :icon, :styles => {
   :ninetysix => ['96x96#', :png],
  },
  :default_url => 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_wildcard.png'
    
  # Validate the attached icon is image/jpg, image/png, etc
  validates_attachment_content_type :icon, :content_type => /\Aimage\/.*\Z/

  def hasSelected(user)
    return true if user.settings.metacodes.include? self.id.to_s
    return false
  end
    
  def inMetacodeSet(metacode_set)
    return true if self.metacode_sets.include? metacode_set
    return false
  end
end
