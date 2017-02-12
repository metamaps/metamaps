# frozen_string_literal: true
require 'rails_helper'

RSpec.describe MapMailer, type: :mailer do
  describe 'access_request' do
    let(:map) { create(:map) }
    let(:request) { create(:access_request, map: map) }
    let(:mail) { described_class.access_request(request) }

    it { expect(mail.from).to eq ['team@metamaps.cc'] }
    it { expect(mail.to).to eq [map.user.email] }
    it { expect(mail.subject).to match map.name }
    it { expect(mail.body.encoded).to match map.name }
    it { expect(mail.body.encoded).to match request.user.name }
    it { expect(mail.body.encoded).to match 'Allow' }
    it { expect(mail.body.encoded).to match 'Decline' }
  end

  describe 'invite_to_edit' do
    let(:inviter) { create(:user) }
    let(:map) { create(:map, user: inviter) }
    let(:invited) { create(:user) }
    let(:user_map) { create(:user_map, map: map, user: invited) }
    let(:mail) { described_class.invite_to_edit(user_map) }

    it { expect(mail.from).to eq ['team@metamaps.cc'] }
    it { expect(mail.to).to eq [invited.email] }
    it { expect(mail.subject).to match map.name }
    it { expect(mail.body.encoded).to match inviter.name }
    it { expect(mail.body.encoded).to match map.name }
  end
end
