class UserMap < ApplicationRecord
  belongs_to :map
  belongs_to :user
end
