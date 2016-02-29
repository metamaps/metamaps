class Synapse < ActiveRecord::Base
  belongs_to :user

  belongs_to :topic1, :class_name => "Topic", :foreign_key => "node1_id"
  belongs_to :topic2, :class_name => "Topic", :foreign_key => "node2_id"

  has_many :mappings, as: :mappable, dependent: :destroy
  has_many :maps, :through => :mappings

  validates :desc, length: { minimum: 0, allow_nil: false }

  validates :permission, presence: true
  validates :permission, inclusion: { in: Perm::ISSIONS.map(&:to_s) }

  validates :category, inclusion: { in: ['from-to', 'both'], allow_nil: true }

  # :nocov:
  def user_name
    user.name
  end
  # :nocov:

  # :nocov:
  def user_image
    user.image.url
  end
  # :nocov:

  # :nocov:
  def as_json(options={})
    super(:methods =>[:user_name, :user_image])
  end
  # :nocov:
  
  ##### PERMISSIONS ######
  
  # returns false if user not allowed to 'show' Topic, Synapse, or Map
  def authorize_to_show(user)  
	if (self.permission == "private" && self.user != user)
		return false
	end
	return self
  end
  
  # returns false if user not allowed to 'edit' Topic, Synapse, or Map
  def authorize_to_edit(user)  
	if (self.permission == "private" && self.user != user)
		return false
	elsif (self.permission == "public" && self.user != user)
		return false
	end
	return self
  end

  def authorize_to_delete(user)  
    if (self.user == user || user.admin)
      return self
    end
    return false
  end
end
