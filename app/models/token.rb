class Token < ActiveRecord::Base
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
      if candidate.size >= CHARS
        return candidate[0...CHARS]
      end
    end
  end

end
