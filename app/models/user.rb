require 'open-uri'

class User < ActiveRecord::Base

  has_many :topics
  has_many :synapses
  has_many :maps
  has_many :mappings

  before_create :generate_code

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

  def as_json(options={})
    { :id => self.id,
      :name => self.name,
      :image => self.image.url(:sixtyfour),
      :admin => self.admin
    }
  end
  
  def generate_code
    #generate a random 8 letter/digit code that they can use to invite people
	  self.code = rand(36**8).to_s(36)

    $codes.push(self.code)

    self.generation = self.get_generation
  end

  def get_generation
    if self.joinedwithcode == self.code
      # if your joinedwithcode equals your code you must be GEN 0
      gen = 0
    elsif self.generation
      # if your generation has already been calculated then just return that value
      gen = self.generation
    else
      # if your generation hasn't been calculated, base it off the
      # generation of the person whose code you joined with + 1
      gen = User.find_by_code(self.joinedwithcode).get_generation + 1
    end
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
