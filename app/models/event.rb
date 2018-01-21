# frozen_string_literal: true

class Event < ApplicationRecord
  KINDS = %w[user_present_on_map user_not_present_on_map
             conversation_started_on_map
             topic_added_to_map topic_moved_on_map topic_removed_from_map
             synapse_added_to_map synapse_removed_from_map
             topic_updated synapse_updated].freeze

  belongs_to :eventable, polymorphic: true
  belongs_to :map
  belongs_to :user

  scope :chronologically, (-> { order('created_at asc') })

  after_create :notify_webhooks!, if: :map

  validates :kind, inclusion: { in: KINDS }
  validates :eventable, presence: true

  def belongs_to?(this_user)
    user_id == this_user.id
  end

  def notify_webhooks!
    map.webhooks.each { |webhook| WebhookService.publish! webhook: webhook, event: self }
  end
  handle_asynchronously :notify_webhooks!
end
