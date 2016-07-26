class Webhook < ActiveRecord::Base
  belongs_to :hookable, polymorphic: true

  validates :uri, presence: true
  validates :hookable, presence: true
  validates :kind, inclusion: { in: %w(slack) }
  validates :event_types, length: { minimum: 1 }

  def headers
    {}
  end
end
