require 'open-uri'

class User < ActiveRecord::Base

has_many :people
has_many :groups
has_many :items

  acts_as_authentic do |configuration| 
    configuration.session_class = Session
    configuration.require_password_confirmation = false
    
    configuration.merge_validates_format_of_email_field_options unless: Proc.new { |user| user.email.blank? and user.authed? }
    configuration.merge_validates_length_of_email_field_options unless: Proc.new { |user| user.email.blank? and user.authed? }
    #configuration.merge_validates_length_of_password_field_options unless: Proc.new { |user| user.password.blank? and user.authed? }
  end
  
  validates :password, :presence => true,
                       :length => {:within => 6..20},
                       :on => :create
  validates :password, :length => {:within => 6..20},
                       :allow_blank => true,
                       :on => :update

end
