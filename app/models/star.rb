# frozen_string_literal: true
class Star < ActiveRecord::Base
  belongs_to :user
  belongs_to :map
  validates :map, uniqueness: { scope: :user, message: 'You have already starred this map' }

  #after_create :after_created_async
  #before_destroy :before_destroyed
  
  protected
  
  def after_created_async
    FollowService.follow(map, user, 'starred')
    NotificationService.notify_followers(map, 'map_starred', self, 'created')
  end
  handle_asynchronously :after_created_async
  
  def before_destroyed
    FollowService.remove_reason(map, user, 'starred')
  end
end
