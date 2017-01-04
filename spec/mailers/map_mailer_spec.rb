# frozen_string_literal: true
require 'rails_helper'

RSpec.describe MapMailer, type: :mailer do
  describe 'access_request_email' do
    let(:map) { create(:map) }
    let(:request) { create(:access_request, map: map) }
    let(:mail) { described_class.access_request_email(request) }

    it { expect(mail.from).to eq ['team@metamaps.cc'] }
    it { expect(mail.to).to eq [map.user.email] }
    it { expect(mail.subject).to match map.name }
    it { expect(mail.body.encoded).to match map.name }
    it { expect(mail.body.encoded).to match request.user.name }
    it { expect(mail.body.encoded).to match 'Allow' }
    it { expect(mail.body.encoded).to match 'Decline' }
  end

  describe 'invite_to_edit_email' do
    let(:map) { create(:map) }
    let(:inviter) { create(:user) }
    let(:invitee) { create(:user) }
    let(:mail) { described_class.invite_to_edit_email(map, inviter, invitee) }

    it { expect(mail.from).to eq ['team@metamaps.cc'] }
    it { expect(mail.to).to eq [invitee.email] }
    it { expect(mail.subject).to match map.name }
    it { expect(mail.body.encoded).to match inviter.name }
    it { expect(mail.body.encoded).to match map.name }
    it { expect(mail.body.encoded).to match map_url(map) }
  end
end
