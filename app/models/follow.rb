# frozen_string_literal: true

class Follow < ApplicationRecord
  belongs_to :user
  belongs_to :followed, polymorphic: true
  has_one    :follow_reason, dependent: :destroy

  validates :user, presence: true
  validates :followed, presence: true
  validates :user, uniqueness: { scope: :followed, message: 'This entity is already followed by this user' }

  after_create :add_subsetting

  scope :active, (-> { where(muted: false) })

  private

  def add_subsetting
    FollowReason.create!(follow: self)
  end
end
