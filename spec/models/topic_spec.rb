require 'rails_helper'

RSpec.describe Topic, type: :model do
  it { is_expected.to belong_to :user }
  it { is_expected.to belong_to :metacode }
  it { is_expected.to have_many :maps }

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
    pending "TODO"
  end
end
