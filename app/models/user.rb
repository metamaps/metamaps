require 'open-uri'

class User < ActiveRecord::Base

  has_many :topics
  has_many :synapses
  has_many :maps
  has_many :mappings

  after_create :generate_code

  devise :database_authenticatable, :recoverable, :rememberable, :trackable, :registerable
  
  serialize :settings, UserPreference
	
  validates :password, :presence => true,
                       :length => { :within => 8..40 },
                       :on => :create
  validates :password, :length => { :within => 8..40 },
                       :allow_blank => true,
                       :on => :update
  validates_confirmation_of :password

  validates_presence_of :name # done by devise
  validates_presence_of :email # done by devise
  validates_uniqueness_of :name # done by devise
  validates_uniqueness_of :email # done by devise

  validates :joinedwithcode, :presence => true, :inclusion => { :in => $codes, :message => "%{value} is not valid" }, :on => :create
    
  # This method associates the attribute ":image" with a file attachment
  has_attached_file :image, :styles => {
   :thirtytwo => ['32x32#', :png],
   :sixtyfour => ['64x64#', :png],
   :ninetysix => ['96x96#', :png],
   :onetwentyeight => ['128x128#', :png]
  },
  :default_url => 'https://s3.amazonaws.com/metamaps-assets/site/user.png'
    
  # Validate the attached image is image/jpg, image/png, etc
  validates_attachment_content_type :image, :content_type => /\Aimage\/.*\Z/

  # override default as_json
  def as_json(options={})
    { :id => self.id,
      :name => self.name,
      :image => self.image.url(:sixtyfour),
      :admin => self.admin
    }
  end

  def as_json_for_autocomplete
    json = {}
    json['id'] = id
    json['label'] = name
    json['value'] = name
    json['profile'] = image.url(:sixtyfour)
    json['mapCount'] = maps.count
    json['generation'] = generation
    json['created_at'] = created_at.strftime("%m/%d/%Y")
    json['rtype'] = "mapper"
    json
  end
  
  #generate a random 8 letter/digit code that they can use to invite people
  def generate_code
	  self.code ||= rand(36**8).to_s(36)
    $codes.push(self.code)
    self.generation = get_generation!
  end

  def get_generation!
    if code == joinedwithcode
      update(generation: 0)
    else
      update(generation: User.find_by_code(joinedwithcode).generation + 1)
    end
  end
  
  def settings
    # make sure we always return a UserPreference instance
    if read_attribute(:settings).nil?
      write_attribute :settings, UserPreference.new
    end
    read_attribute :settings
  end
  
  def settings=(val)
    write_attribute :settings, val
  end

end
