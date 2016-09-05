require 'rails_helper'

RSpec.describe MappingPolicy, type: :policy do
  subject { described_class }

  context 'unauthenticated' do
    context 'commons' do
      let(:map) { create(:map, permission: :commons) }
      let(:topic) { create(:topic, permission: :commons) }
      let(:mapping) { create(:mapping, mappable: topic, map: map) }

      permissions :show? do
        it 'permits access' do
          expect(subject).to permit(nil, mapping)
        end
      end
      permissions :create?, :update?, :destroy? do
        it 'denies access' do
          expect(subject).to_not permit(nil, mapping)
        end
      end
    end

    context 'private' do
      let(:map) { create(:map, permission: :private) }
      let(:topic) { create(:topic, permission: :private) }
      let(:mapping) { create(:mapping, mappable: topic, map: map) }

      permissions :show?, :create?, :update?, :destroy? do
        it 'denies access' do
          expect(subject).to_not permit(nil, mapping)
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
      let(:topic) { create(:topic, permission: :commons, user: owner) }
      let(:map) { create(:map, permission: :commons, user: owner) }
      let(:mapping) { create(:mapping, mappable: topic, map: map) }

      permissions :show?, :create?, :update?, :destroy? do
        it 'permits access' do
          expect(subject).to permit(user, mapping)
        end
      end
    end

    context 'public' do
      let(:owner) { create(:user) }
      let(:topic) { create(:topic, permission: :public, user: owner) }
      let(:map) { create(:map, permission: :public, user: owner) }
      let(:mapping) { create(:mapping, mappable: topic, map: map) }

      permissions :show? do
        it 'permits access' do
          expect(subject).to permit(user, mapping)
        end
      end
      permissions :create?, :update?, :destroy? do
        it 'denies access' do
          expect(subject).to_not permit(user, mapping)
        end
        it 'permits access to owner' do
          expect(subject).to permit(owner, mapping)
        end
      end
    end

    context 'private' do
      let(:owner) { create(:user) }
      let(:topic) { create(:topic, permission: :private, user: owner) }
      let(:map) { create(:map, permission: :public, user: owner) }
      let(:mapping) { create(:mapping, mappable: topic, map: map) }

      permissions :show?, :create?, :update?, :destroy? do
        it 'denies access' do
          expect(subject).to_not permit(user, mapping)
        end
        it 'permits access to owner' do
          expect(subject).to permit(owner, mapping)
        end
      end
    end
  end
end
