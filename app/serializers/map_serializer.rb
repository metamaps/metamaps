class MapSerializer < ActiveModel::Serializer
  embed :ids, include: true
  attributes :id,
             :name,
             :desc,
             :permission,
             :screenshot,
             :created_at,
             :updated_at

  has_many :topics
  has_many :synapses
  has_many :mappings
  has_many :contributors, root: :users

  #def filter(keys)
  #  keys.delete(:outcome_author) unless object.outcome_author.present?
  #  keys
  #end
end
