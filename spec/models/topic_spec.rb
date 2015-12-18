require 'rails_helper'

RSpec.describe Topic, type: :model do
  it { is_expected.to belong_to :user }
  it { is_expected.to belong_to :metacode }
  it { is_expected.to have_many :maps }
  it { is_expected.to have_many :mappings }
  it { is_expected.to validate_presence_of :permission }
  it { is_expected.to validate_inclusion_of(:permission).in_array Perm::ISSIONS.map(&:to_s) }

  context 'has_viewable_synapses function' do
    let (:user) { create(:user) }
    let (:other_user) { create(:user) }

    context 'topic with no synapses' do
      let (:topic) { create(:topic) }

      it 'returns false' do
        expect(topic.has_viewable_synapses(user)).to eq false
      end
    end

    context 'topic with one unpermitted synapse' do
      let (:topic) { create(:topic) }
      let (:synapse) { create(:synapse, permission: :private, topic1: topic, user: other_user) }

      it 'returns false' do
        expect(topic.has_viewable_synapses(user)).to eq false
      end
    end

    context 'topic with one permitted synapse' do
      let (:topic) { create(:topic) }
      let (:synapse) { create(:synapse, permission: :private, topic1: topic, user: user) }

      it 'returns true' do
        expect(topic.has_viewable_synapses(user)).to eq true
      end
    end

    context 'topic with one unpermitted, one permitted synapse' do
      let (:topic) { create(:topic) }
      let (:synapse1) { create(:synapse, permission: :private, topic1: topic, user: other_user) }
      let (:synapse2) { create(:synapse, permission: :private, topic1: topic, user: user) }

      it 'returns true' do
        expect(topic.synapses.count).to eq 2
        expect(topic.has_viewable_synapses(user)).to eq true
      end
    end
  end

  context 'permssions' do
    let(:other_user) { create :user }
    let(:topic) { create :topic, user: owner, permission: :commons }
    let(:private_topic) { create :topic, user: owner, permission: :private }
    let(:public_topic) { create :topic, user: owner, permission: :public }

    it 'prevents deletion by non-owner' do
      expect(topic.authorize_to_delete(other_user)).to eq false
      expect(topic.authorize_to_delete(owner)).to eq topic
    end

    it 'prevents visibility if private' do
      expect(topic.authorize_to_show(other_user)).to eq true
      expect(topic.authorize_to_show(owner)).to eq true
      expect(private_topic.authorize_to_show(owner)).to eq true
      expect(private_topic.authorize_to_show(other_user)).to eq false
    end

    it 'only allows editing if commons or owned' do
      expect(topic.authorize_to_edit(other_user)).to eq true
      expect(topic.authorize_to_edit(owner)).to eq true
      expect(private_topic.authorize_to_edit(other_user)).to eq false
      expect(private_topic.authorize_to_edit(owner)).to eq true
      expect(public_topic.authorize_to_edit(other_user)).to eq false
      expect(public_topic.authorize_to_edit(owner)).to eq true
    end
  end
end
