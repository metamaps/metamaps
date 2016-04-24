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
  has_many :collaborators, root: :users, serializer: NewUserSerializer

end
