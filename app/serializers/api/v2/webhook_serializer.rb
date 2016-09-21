module Api
  module V2
    class WebhookSerializer < ApplicationSerializer
      attributes :text, :username, :icon_url # , :attachments
    end
  end
end
