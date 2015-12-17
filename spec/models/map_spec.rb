require 'rails_helper'

RSpec.describe Map, type: :model do
  # TODO: what is it important to be sure about when working with a Map?
  it { is_expected.to belong_to :user }
  it { is_expected.to validate_presence_of :name }
  it { is_expected.to validate_presence_of :permission }
  it { is_expected.to validate_inclusion_of(:permission).in_array Perm::ISSIONS.map(&:to_s) }
  it { is_expected.to validate_inclusion_of(:arranged).in_array [true, false] }

  context 'permissions' do
    let(:owner) { create :user }
    let(:other_user) { create :user }
    let(:map) { create :map, user: owner, permission: :commons }

    it 'prevents deletion by non-owner' do
      expect(map.authorize_to_delete(other_user)).to eq false
      expect(map.authorize_to_delete(owner)).to eq map
    end
  end
end

