class NewMappingSerializer < ActiveModel::Serializer
  embed :ids, include: true
  attributes :id,
             :xloc,
             :yloc,
             :created_at,
             :updated_at,
             :mappable_id,
             :mappable_type

  has_one :user, serializer: NewUserSerializer
  has_one :map, serializer: NewMapSerializer

  def filter(keys)
    keys.delete(:xloc) unless object.mappable_type == 'Topic'
    keys.delete(:yloc) unless object.mappable_type == 'Topic'
    keys
  end
end
