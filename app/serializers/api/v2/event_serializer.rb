module Api
  module V2
    class EventSerializer < ApplicationSerializer
      attributes :id, :sequence_id, :kind, :map_id, :created_at

      has_one :actor, serializer: UserSerializer, root: 'users'
      has_one :map, serializer: MapSerializer

      def actor
        object.user || object.eventable.try(:user)
      end

      def map
        object.eventable.try(:map) || object.eventable.map
      end
    end
  end
end
