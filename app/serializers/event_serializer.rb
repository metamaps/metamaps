# frozen_string_literal: true
class EventSerializer < ActiveModel::Serializer
  attributes :id, :sequence_id, :kind, :map_id, :created_at

  has_one :actor, serializer: Api::V2::UserSerializer, root: 'users'
  has_one :map, serializer: Api::V2::MapSerializer

  def actor
    object.user || object.eventable.try(:user)
  end

  def map
    object.eventable.try(:map) || object.eventable.map
  end
end
