class MetacodeSerializer < ActiveModel::Serializer
  attributes :id,
             :name,
             :manual_icon,
             :color,
             :aws_icon
end 
