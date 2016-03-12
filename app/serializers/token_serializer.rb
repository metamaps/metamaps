class TokenSerializer < ActiveModel::Serializer
  embed :ids, include: true
  attributes :id,
             :token,
             :description,
             :user_id,
             :created_at,
             :updated_at

end
