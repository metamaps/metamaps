class SynapseSerializer < ActiveModel::Serializer
  embed :ids, include: true
  attributes :id,
             :desc,
             :category,
             :weight,
             :permission,
             :created_at,
             :updated_at

  has_one :topic1, root: :topics
  has_one :topic2, root: :topics
  has_one :user

  #def filter(keys)
  #  keys.delete(:outcome_author) unless object.outcome_author.present?
  #  keys
  #end
end
