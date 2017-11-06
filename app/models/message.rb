# frozen_string_literal: true

class Message < ApplicationRecord
  belongs_to :user
  belongs_to :resource, polymorphic: true

  delegate :name, to: :user, prefix: true

  after_create :after_created
  # after_create :after_created_async

  def user_image
    user.image.url
  end

  def as_json(_options = {})
    json = super(methods: %i(user_name user_image))
    json
  end

  def after_created
    ActionCable.server.broadcast 'map_' + resource.id.to_s, type: 'messageCreated', message: as_json
  end

  def after_created_async
    FollowService.follow(resource, user, 'commented')
    NotificationService.notify_followers(resource, 'map_message', self)
  end
  handle_asynchronously :after_created_async
end
