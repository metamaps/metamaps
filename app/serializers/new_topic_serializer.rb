class NewTopicSerializer < ActiveModel::Serializer
  embed :ids, include: true
  attributes :id,
             :name,
             :desc,
             :link,
             :permission,
             :created_at,
             :updated_at

  has_one :user, serializer: NewUserSerializer
  has_one :metacode, serializer: NewMetacodeSerializer
end
