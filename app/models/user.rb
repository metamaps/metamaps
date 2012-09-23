require 'open-uri'

class User < ActiveRecord::Base

has_many :people
has_many :groups
has_many :items

  acts_as_authentic do |configuration| 
    configuration.session_class = Session
  end
  
  validates :password, :presence => true,
                       :length => {:within => 6..20},
                       :on => :create
  validates :password, :length => {:within => 6..20},
                       :allow_blank => true,
                       :on => :update

end
