class Token < ApplicationRecord
  belongs_to :user

  before_create :assign_token

  CHARS = 32

  private

  def assign_token
    self.token = generate_token
  end

  def generate_token
    loop do
      candidate = SecureRandom.base64(CHARS).gsub(/\W/, '')
      return candidate[0...CHARS] if candidate.size >= CHARS
    end
  end
end
