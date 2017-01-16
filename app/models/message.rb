# frozen_string_literal: true
class Message < ApplicationRecord
  belongs_to :user
  belongs_to :resource, polymorphic: true

  delegate :name, to: :user, prefix: true
  
  after_create :after_created

  def user_image
    user.image.url
  end

  def as_json(_options = {})
    json = super(methods: [:user_name, :user_image])
    json
  end
  
  def after_created
    ActionCable.server.broadcast 'map_' + resource.id.to_s, type: 'messageCreated', message: self.as_json
  end
end
