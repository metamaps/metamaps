class NewMapSerializer < ActiveModel::Serializer
  embed :ids, include: true
  attributes :id,
             :name,
             :desc,
             :permission,
             :screenshot,
             :created_at,
             :updated_at

  has_many :topics, serializer: NewTopicSerializer
  has_many :synapses, serializer: NewSynapseSerializer
  has_many :mappings, serializer: NewMappingSerializer
  has_many :contributors, root: :users, serializer: NewUserSerializer

  #def filter(keys)
  #  keys.delete(:outcome_author) unless object.outcome_author.present?
  #  keys
  #end
end
