require 'rails_helper'

RSpec.describe Token, type: :model do
  context '#generate_token' do
    subject(:token) { Token.new }
    it 'should generate an alphanumeric token of 32 characters' do
      expect(token.send(:generate_token)).to match(/^[a-zA-Z0-9]{32}$/)
    end
  end
end
