require 'rails_helper'

RSpec.describe Map, type: :model do
  # TODO: what is it important to be sure about when working with a Map?
  it { is_expected.to belong_to :user }
  it { is_expected.to validate_presence_of :name }
  it { is_expected.to validate_presence_of :permission }
  it { is_expected.to validate_inclusion_of(:permission).in_array Perm::ISSIONS.map(&:to_s) }

  context 'permissions' do
    let(:owner) { create :user }
    let(:other_user) { create :user }
    let(:map) { create :map, user: owner, permission: :commons }
    let(:private_map) { create :map, user: owner, permission: :private }
    let(:public_map) { create :map, user: owner, permission: :public }

    it 'prevents deletion by non-owner' do
      expect(map.authorize_to_delete(other_user)).to eq false
      expect(map.authorize_to_delete(owner)).to eq map
    end

    it 'prevents visibility if private' do
      expect(map.authorize_to_show(other_user)).to eq true
      expect(map.authorize_to_show(owner)).to eq true
      expect(private_map.authorize_to_show(owner)).to eq true
      expect(private_map.authorize_to_show(other_user)).to eq false
    end

    it 'only allows editing if commons or owned' do
      expect(map.authorize_to_edit(other_user)).to eq true
      expect(map.authorize_to_edit(owner)).to eq true
      expect(private_map.authorize_to_edit(other_user)).to eq false
      expect(private_map.authorize_to_edit(owner)).to eq true
      expect(public_map.authorize_to_edit(other_user)).to eq false
      expect(public_map.authorize_to_edit(owner)).to eq true
    end
  end
end

