class NewSynapseSerializer < ActiveModel::Serializer
  embed :ids, include: true
  attributes :id,
             :desc,
             :category,
             :weight,
             :permission,
             :created_at,
             :updated_at

  has_one :topic1, root: :topics, serializer: NewTopicSerializer
  has_one :topic2, root: :topics, serializer: NewTopicSerializer
  has_one :user, serializer: NewUserSerializer
end
