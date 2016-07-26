class WebhookSerializer < ActiveModel::Serializer
  attributes :text, :username, :icon_url # , :attachments
end
