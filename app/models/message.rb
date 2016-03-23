class Message < ActiveRecord::Base

  belongs_to :user
  belongs_to :resource, polymorphic: true

  def user_name
    self.user.name
  end

  def user_image
    self.user.image.url
  end

  def as_json(options={})
    json = super(:methods =>[:user_name, :user_image])
    json
  end

end
