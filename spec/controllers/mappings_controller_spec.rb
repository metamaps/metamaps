require 'rails_helper'

RSpec.describe MappingsController, type: :controller do
  let(:user) { create(:user) }
  let!(:mapping) { create(:mapping, user: user) }
  let(:valid_attributes) { mapping.attributes.except('id') }
  let(:invalid_attributes) { { id: mapping.id } }
  before :each do
    sign_in user
  end

  describe 'POST #create' do
    context 'with valid params' do
      it 'creates a new Mapping' do
        expect do
          post :create, params: {
            mapping: valid_attributes
          }
        end.to change(Mapping, :count).by(1)
      end

      it 'assigns a newly created mapping as @mapping' do
        post :create, params: {
          mapping: valid_attributes
        }
        expect(comparable(Mapping.last)).to eq comparable(mapping)
      end
    end

    context 'with invalid params' do
      it 'assigns a newly created but unsaved mapping as @mapping' do
        post :create, params: {
          mapping: invalid_attributes
        }
        # for some reason, the first mapping is still persisted
        # TODO: fixme??
        expect(Mapping.count).to eq 1
      end
    end
  end

  describe 'PUT #update' do
    context 'with valid params' do
      let(:new_attributes) { build(:mapping_random_location).attributes.except('id') }

      it 'updates the requested mapping' do
        put :update, params: {
          id: mapping.to_param, mapping: new_attributes
        }
        mapping.reload
      end

      it 'assigns the requested mapping as @mapping' do
        put :update, params: {
          id: mapping.to_param, mapping: valid_attributes
        }
        expect(Mapping.last).to eq mapping
      end
    end

    context 'with invalid params' do
      it 'assigns the mapping as @mapping' do
        put :update, params: {
          id: mapping.to_param, mapping: invalid_attributes
        }
        expect(Mapping.last).to eq mapping
      end
    end
  end

  describe 'DELETE #destroy' do
    it 'destroys the requested mapping' do
      expect do
        delete :destroy, params: {
          id: mapping.to_param
        }
      end.to change(Mapping, :count).by(-1)
    end
  end
end
