require 'rails_helper'

RSpec.describe MappingsController, type: :controller do
  let!(:mapping) { create(:mapping) }
  let(:valid_attributes) { mapping.attributes.except('id') }
  let(:invalid_attributes) { { xloc: 0 } }
  before :each do
    sign_in
  end

  describe 'GET #show' do
    it 'assigns the requested mapping as @mapping' do
      get :show, { id: mapping.to_param }
      expect(assigns(:mapping)).to eq(mapping)
    end
  end

  describe 'POST #create' do
    context 'with valid params' do
      it 'creates a new Mapping' do
        expect do
          post :create, { mapping: valid_attributes }
        end.to change(Mapping, :count).by(1)
      end

      it 'assigns a newly created mapping as @mapping' do
        post :create, { mapping: valid_attributes }
        expect(assigns(:mapping)).to be_a(Mapping)
        expect(assigns(:mapping)).to be_persisted
      end
    end

    context 'with invalid params' do
      it 'assigns a newly created but unsaved mapping as @mapping' do
        post :create, { mapping: invalid_attributes }
        expect(assigns(:mapping)).to be_a_new(Mapping)
      end
    end
  end

  describe 'PUT #update' do
    context 'with valid params' do
      let(:new_attributes) { build(:mapping_random_location).attributes.except('id') }

      it 'updates the requested mapping' do
        put :update,
            { id: mapping.to_param, mapping: new_attributes }
        mapping.reload
      end

      it 'assigns the requested mapping as @mapping' do
        put :update,
            { id: mapping.to_param, mapping: valid_attributes }
        expect(assigns(:mapping)).to eq(mapping)
      end
    end

    context 'with invalid params' do
      it 'assigns the mapping as @mapping' do
        put :update,
            { id: mapping.to_param, mapping: invalid_attributes }
        expect(assigns(:mapping)).to eq(mapping)
      end
    end
  end

  describe 'DELETE #destroy' do
    it 'destroys the requested mapping' do
      expect do
        delete :destroy, { id: mapping.to_param }
      end.to change(Mapping, :count).by(-1)
    end
  end
end
