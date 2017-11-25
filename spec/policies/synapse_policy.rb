# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SynapsePolicy, type: :policy do
  subject { described_class }

  context 'unauthenticated' do
    context 'commons' do
      let(:synapse) { create(:synapse, permission: :commons) }
      permissions :show? do
        it 'permits access' do
          expect(subject).to permit(nil, synapse)
        end
      end
      permissions :create?, :update?, :destroy? do
        it 'denies access' do
          expect(subject).to_not permit(nil, synapse)
        end
      end
    end

    context 'private' do
      let(:synapse) { create(:synapse, permission: :private) }
      permissions :show?, :create?, :update?, :destroy? do
        it 'denies access' do
          expect(subject).to_not permit(nil, synapse)
        end
      end
    end
  end

  #
  # Now begin the logged-in tests
  #

  context 'logged in' do
    let(:user) { create(:user) }

    context 'commons' do
      let(:owner) { create(:user) }
      let(:synapse) { create(:synapse, permission: :commons, user: owner) }
      permissions :show?, :create?, :update? do
        it 'permits access' do
          expect(subject).to permit(user, synapse)
        end
      end
      permissions :destroy? do
        it 'denies access' do
          expect(subject).to_not permit(user, synapse)
        end
        it 'permits access to owner' do
          expect(subject).to permit(owner, synapse)
        end
      end
    end

    context 'public' do
      let(:owner) { create(:user) }
      let(:synapse) { create(:synapse, permission: :public, user: owner) }
      permissions :show?, :create? do
        it 'permits access' do
          expect(subject).to permit(user, synapse)
        end
      end
      permissions :update?, :destroy? do
        it 'denies access' do
          expect(subject).to_not permit(user, synapse)
        end
        it 'permits access to owner' do
          expect(subject).to permit(owner, synapse)
        end
      end
    end

    context 'private' do
      let(:owner) { create(:user) }
      let(:synapse) { create(:synapse, permission: :private, user: owner) }
      permissions :create? do
        it 'permits access' do
          expect(subject).to permit(user, synapse)
        end
      end
      permissions :show?, :update?, :destroy? do
        it 'denies access' do
          expect(subject).to_not permit(user, synapse)
        end
        it 'permits access to owner' do
          expect(subject).to permit(owner, synapse)
        end
      end
    end
  end
end
