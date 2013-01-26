require 'open-uri'

class User < ActiveRecord::Base

has_many :topics
has_many :synapses
has_many :maps
has_many :mappings

  acts_as_authentic do |configuration| 
    configuration.session_class = Session
	configuration.require_password_confirmation = false
    
    configuration.merge_validates_format_of_email_field_options unless: Proc.new { |user| user.email.blank? and user.authed? }
    configuration.merge_validates_length_of_email_field_options unless: Proc.new { |user| user.email.blank? and user.authed? }
  end
  
  serialize :settings, UserPreference
  
  validates :password, :presence => true,
					   :length => {
					   :maximum => 20,
					   :too_long  => "is too long (maximum is %{count} characters)" },
                       :on => :create
  validates :password, :allow_blank => true,
					   :length => {
					   :maximum => 20,
					   :too_long  => "is too long (maximum is %{count} characters)"},
                       :on => :update
	
  validates :joinedwithcode, :presence => true, :inclusion => { :in => User.all.map(&:code), :message => "%{value} is not a valid code" }, :on => :create
  
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
