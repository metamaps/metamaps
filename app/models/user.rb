require 'open-uri'

class User < ActiveRecord::Base

  has_many :topics
  has_many :synapses
  has_many :maps
  has_many :mappings

  before_create :generate_code

  devise :database_authenticatable, :recoverable, :rememberable, :trackable, :registerable
  
  attr_accessible :name, :email, :image, :password, :password_confirmation, :code, :joinedwithcode, :remember_me

  serialize :settings, UserPreference
	
  validates_uniqueness_of :name # done by devise
  validates_uniqueness_of :email # done by devise
    
  # This method associates the attribute ":image" with a file attachment
  has_attached_file :image, :styles => {
   :thumb => ['100x100>', :png],
   :square => ['200x200#', :png],
   :round => ['200x200#', :png]
  },
  :default_url => "/assets/user.png"
    
  #, :convert_options => {:round => Proc.new{self.convert_options}}

  # Validate the attached image is image/jpg, image/png, etc
  validates_attachment_content_type :image, :content_type => /\Aimage\/.*\Z/
  
  def self.convert_options
    trans = ''
    trans << ' ( +clone  -alpha extract '
    trans << '-draw "fill black polygon 0,0 0,100 100,0 fill white circle 100,100 100,0" '
    trans << '( +clone -flip ) -compose multiply -composite '
    trans << '( +clone -flop ) -compose multiply -composite '
    trans << ') -alpha off -compose copy_opacity -composite '
  end

  def as_json(options={})
    { :id => self.id,
      :name => self.name,
      :image => self.image.url
    }
  end
    
  if ActiveRecord::Base.connection.table_exists? 'users' 
    codes =  ActiveRecord::Base.connection.execute("SELECT code FROM users").map {|user| user["code"] }
  else 
    codes = []
  end
  
  validates :joinedwithcode, :presence => true, :inclusion => { :in => codes, :message => "%{value} is not a valid code" }, :on => :create
  
  def generate_code
    #generate a random 8 letter/digit code that they can use to invite people
	  self.code = rand(36**8).to_s(36)
  end
  
  def settings
    # make sure we always return a UserPreference instance
    if read_attribute(:settings).nil?
      write_attribute :settings, UserPreference.new
      read_attribute :settings
    else
      read_attribute :settings
    end
  end
  
  def settings=(val)
    write_attribute :settings, val
  end
end
