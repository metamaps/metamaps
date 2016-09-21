class Event < ApplicationRecord
  KINDS = %w(user_present_on_map conversation_started_on_map topic_added_to_map synapse_added_to_map).freeze

  # has_many :notifications, dependent: :destroy
  belongs_to :eventable, polymorphic: true
  belongs_to :map
  belongs_to :user

  scope :chronologically, -> { order('created_at asc') }

  after_create :notify_webhooks!, if: :map

  validates :kind, inclusion: { in: KINDS }
  validates :eventable, presence: true

  # def notify!(user)
  #  notifications.create!(user: user)
  # end

  def belongs_to?(this_user)
    user_id == this_user.id
  end

  def notify_webhooks!
    # group = self.discussion.group
    map.webhooks.each { |webhook| WebhookService.publish! webhook: webhook, event: self }
    # group.webhooks.each           { |webhook| WebhookService.publish! webhook: webhook, event: self }
  end
  handle_asynchronously :notify_webhooks!
end
