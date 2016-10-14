require 'rails_helper'

RSpec.describe MapMailer, type: :mailer do
  let(:map) { create(:map) }
  let(:inviter) { create(:user) }
  let(:invitee) { create(:user) }
  describe 'invite_to_edit_email' do
    let(:mail) { described_class.invite_to_edit_email(map, inviter, invitee) }

    it { expect(mail.from).to eq ['team@metamaps.cc'] }
    it { expect(mail.to).to eq [invitee.email] }
    it { expect(mail.subject).to match map.name }
    it { expect(mail.body.encoded).to match inviter.name }
    it { expect(mail.body.encoded).to match map.name }
    it { expect(mail.body.encoded).to match map_url(map) }
  end
end
