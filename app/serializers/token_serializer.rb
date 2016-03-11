class TokenSerializer < ActiveModel::Serializer
  embed :ids, include: true
  attributes :id,
             :token,
             :description,
             :user_id,
             :created_at,
             :updated_at

  #def filter(keys)
  #  keys.delete(:outcome_author) unless object.outcome_author.present?
  #  keys
  #end
end
