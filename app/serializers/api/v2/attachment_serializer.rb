# frozen_string_literal: true

module Api
  module V2
    class AttachmentSerializer < ApplicationSerializer
      attributes :id,
                 :file,
                 :attachable_type,
                 :attachable_id,
                 :created_at,
                 :updated_at
    end
  end
end
