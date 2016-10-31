require 'rails_helper'

RSpec.describe AccessRequest, type: :model do
  include ActiveJob::TestHelper # enqueued_jobs

  let(:access_request) { create(:access_request) }

  describe 'approve' do
    before :each do
      access_request.approve
    end

    it { expect(access_request.approved).to be true }
    it { expect(access_request.answered).to be true }
    it { expect(UserMap.count).to eq 1 }
    it { expect(enqueued_jobs.count).to eq 1 }
  end

  describe 'deny' do
    before :each do
      access_request.deny
    end

    it { expect(access_request.approved).to be false }
    it { expect(access_request.answered).to be true }
    it { expect(UserMap.count).to eq 0 }
    it { expect(enqueued_jobs.count).to eq 0 }
  end
end
