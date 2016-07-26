class NewUserSerializer < ActiveModel::Serializer
  attributes :id,
             :name,
             :avatar,
             :is_admin,
             :generation

  def avatar
    object.image.url(:sixtyfour)
  end

  def is_admin
    object.admin
  end
end
