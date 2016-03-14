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
      let (:synapse) { create(:synapse, permission: :private, user: other_user) }
      let (:topic) { create(:topic, synapses1: [synapse]) }

      it 'returns false' do
        expect(topic.has_viewable_synapses(user)).to eq false
      end
    end

    context 'topic with one permitted synapse' do
      let (:synapse) { create(:synapse, permission: :private, user: user) }
      let(:topic) { create(:topic, synapses1: [synapse]) }

      it 'returns true' do
        expect(topic.has_viewable_synapses(user)).to eq true
      end
    end

    context 'topic with one unpermitted, one permitted synapse' do
      let (:synapse1) { create(:synapse, permission: :private, user: other_user) }
      let (:synapse2) { create(:synapse, permission: :private, user: user) }
      let (:topic) { create(:topic, synapses1: [synapse1, synapse2]) }

      it 'returns true' do
        expect(topic.synapses.count).to eq 2
        expect(topic.has_viewable_synapses(user)).to eq true
      end
    end
  end
end
