# frozen_string_literal: true
require 'rails_helper'

RSpec.describe AccessRequest, type: :model do
  let(:access_request) { create(:access_request) }

  describe 'approve' do
    before :each do
      access_request.approve
    end

    it { expect(access_request.approved).to be true }
    it { expect(access_request.answered).to be true }
  end

  describe 'deny' do
    before :each do
      access_request.deny
    end

    it { expect(access_request.approved).to be false }
    it { expect(access_request.answered).to be true }
  end
end
