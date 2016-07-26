class TokenSerializer < ActiveModel::Serializer
  attributes :id,
             :token,
             :description,
             :created_at,
             :updated_at
end
