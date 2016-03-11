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

  #def filter(keys)
  #  keys.delete(:outcome_author) unless object.outcome_author.present?
  #  keys
  #end
end
