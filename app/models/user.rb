require 'open-uri'

class User < ActiveRecord::Base

has_many :topics
has_many :synapses
has_many :maps
has_many :mappings

  before_create :generate_code

  devise :database_authenticatable, :recoverable, :rememberable, :trackable, :registerable
  
  attr_accessible :name, :email, :password, :password_confirmation, :code, :joinedwithcode, :remember_me

  serialize :settings, UserPreference
	
  validates_uniqueness_of :name # done by devise
  validates_uniqueness_of :email # done by devise
  if Object.const_defined?('User') 
    codes = User.all.map(&:code)
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
