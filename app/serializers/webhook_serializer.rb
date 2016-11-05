# frozen_string_literal: true
class WebhookSerializer < ActiveModel::Serializer
  attributes :text, :username, :icon_url # , :attachments
  attribute :channel, if: :has_channel?

  def has_channel?
    true if object.channel
  end
end
