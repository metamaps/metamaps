# frozen_string_literal: true
require 'open-uri'

class User < ApplicationRecord
  acts_as_messageable # mailboxer notifications

  has_many :topics
  has_many :synapses
  has_many :maps
  has_many :mappings
  has_many :tokens
  has_many :stars
  has_many :user_maps, dependent: :destroy
  has_many :shared_maps, through: :user_maps, source: :map

  after_create :generate_code

  devise :database_authenticatable, :recoverable, :rememberable, :trackable, :registerable

  serialize :settings, UserPreference

  validates :password, presence: true,
                       length: { within: 8..40 },
                       on: :create
  validates :password, length: { within: 8..40 },
                       allow_blank: true,
                       on: :update
  validates :password, confirmation: true

  validates :name, presence: true # done by devise
  validates :email, presence: true # done by devise
  validates :name, uniqueness: true # done by devise
  validates :email, uniqueness: true # done by devise

  validates :joinedwithcode, presence: true, inclusion: { in: $codes, message: '%{value} is not valid' }, on: :create

  # This method associates the attribute ":image" with a file attachment
  has_attached_file :image, styles: {
    thirtytwo: ['32x32#', :png],
    sixtyfour: ['64x64#', :png],
    ninetysix: ['96x96#', :png],
    onetwentyeight: ['128x128#', :png]
  },
                            default_url: 'https://s3.amazonaws.com/metamaps-assets/site/user.png'

  # Validate the attached image is image/jpg, image/png, etc
  validates_attachment_content_type :image, content_type: %r{\Aimage/.*\Z}

  # override default as_json
  def as_json(_options = {})
    { id: id,
      name: name,
      image: image.url(:sixtyfour),
      admin: admin }
  end

  def as_json_for_autocomplete
    json = {}
    json['id'] = id
    json['label'] = name
    json['value'] = name
    json['profile'] = image.url(:sixtyfour)
    json['mapCount'] = maps.count
    json['generation'] = generation
    json['created_at'] = created_at.strftime('%m/%d/%Y')
    json['rtype'] = 'mapper'
    json
  end
  
  def recentMetacodes
    array = []
    self.topics.sort{|a,b| b.created_at <=> a.created_at }.each do |t|
      if array.length < 5 and array.index(t.metacode_id) == nil
        array.push(t.metacode_id)
      end
    end
    array
  end

  def mostUsedMetacodes
    self.topics.to_a.reduce({}) { |memo, topic| 
      if memo[topic.metacode_id] == nil
        memo[topic.metacode_id] = 1 
      else 
        memo[topic.metacode_id] = memo[topic.metacode_id] + 1
      end
      
      memo
    }.to_a.sort{ |a, b| b[1] <=> a[1] }.map{|i| i[0]}.slice(0, 5)
  end

  def as_rdf(opts = {})
    base_url = opts[:base_url] || 'https://metamaps.cc'
    output = ''
    output += %(d:mapper_#{id} a foaf:OnlineAccount ;\n)
    output += %(  foaf:accountName "#{name}" ;\n)
    output += %(  foaf:accountServiceHomepage "#{base_url}/mapper/#{id}" ;\n)
    output[-2] = '.' # change last ; to a .
    output += %(\n)
    output
  end

  def all_accessible_maps
    maps + shared_maps
  end

  def recent_metacodes
    topics.order(:created_at).pluck(:metacode_id).uniq.first(5)
  end

  def most_used_metacodes
    topics.to_a.each_with_object(Hash.new(0)) do |topic, memo|
      memo[topic.metacode_id] += 1
      memo
    end.to_a.sort { |a, b| b[1] <=> a[1] }.map { |i| i[0] }.slice(0, 5)
  end

  # generate a random 8 letter/digit code that they can use to invite people
  def generate_code
    self.code ||= rand(36**8).to_s(36)
    $codes.push(self.code)
    self.generation = get_generation!
  end

  def get_generation!
    if code == joinedwithcode
      update(generation: 0)
    else
      update(generation: User.find_by(code: joinedwithcode).generation + 1)
    end
  end

  def starred_map?(map)
    stars.where(map_id: map.id).exists?
  end

  def settings
    # make sure we always return a UserPreference instance
    self[:settings] = UserPreference.new if self[:settings].nil?
    self[:settings]
  end

  def settings=(val)
    self[:settings] = val
  end

  # Mailboxer hooks and helper functions

  def mailboxer_email(_message)
    return email if emails_allowed
    # else return nil, which sends no email
  end

  def mailboxer_notifications
    mailbox.notifications
  end

  def mailboxer_notification_receipts
    mailbox.receipts.includes(:notification).where(mailbox_type: nil)
  end
end
