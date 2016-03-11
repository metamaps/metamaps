class TopicSerializer < ActiveModel::Serializer
  embed :ids, include: true
  attributes :id,
             :name,
             :desc,
             :link,
             :permission,
             :created_at,
             :updated_at

  has_one :user
  has_one :metacode

  #def filter(keys)
  #  keys.delete(:outcome_author) unless object.outcome_author.present?
  #  keys
  #end
end
