class Message < ApplicationRecord
  belongs_to :user
  belongs_to :resource, polymorphic: true

  delegate :name, to: :user, prefix: true

  def user_image
    user.image.url
  end

  def as_json(_options = {})
    json = super(methods: [:user_name, :user_image])
    json
  end
end
