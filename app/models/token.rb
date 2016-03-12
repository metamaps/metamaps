class Token < ActiveRecord::Base
  belongs_to :user

  before_create :generate_token

  private
  def generate_token
    self.token = SecureRandom.uuid.gsub(/\-/,'')
  end

end
