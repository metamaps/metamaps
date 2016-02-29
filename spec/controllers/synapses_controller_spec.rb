require 'rails_helper'

RSpec.describe SynapsesController, type: :controller do
  let(:synapse) { create(:synapse) }
  let(:valid_attributes) { synapse.attributes.except('id') }
  let(:invalid_attributes) { { permission: :invalid_lol } } 
  before :each do
    sign_in
  end

  describe 'GET #show' do
    it 'assigns the requested synapse as @synapse' do
      get :show, { id: synapse.to_param, format: :json }
      expect(assigns(:synapse)).to eq(synapse)
    end
  end

  describe 'POST #create' do
    context 'with valid params' do
      it 'creates a new Synapse' do
        synapse.reload # ensure it's present
        expect do
          post :create, { synapse: valid_attributes, format: :json }
        end.to change(Synapse, :count).by(1)
      end

      it 'assigns a newly created synapse as @synapse' do
        post :create, { synapse: valid_attributes, format: :json }
        expect(assigns(:synapse)).to be_a(Synapse)
        expect(assigns(:synapse)).to be_persisted
      end

      it 'returns 201 CREATED' do
        post :create, { synapse: valid_attributes, format: :json }
        expect(response.status).to eq 201
      end
    end

    context 'with invalid params' do
      it 'returns 422 UNPROCESSABLE ENTITY' do
        post :create, { synapse: invalid_attributes, format: :json }
        expect(response.status).to eq 422
      end
    end
  end

  describe 'PUT #update' do
    context 'with valid params' do
      let(:new_attributes) do
        { desc: 'My new description',
          category: 'both',
          permission: :public }
      end

      it 'updates the requested synapse' do
        put :update,
            { id: synapse.to_param, synapse: new_attributes, format: :json }
        synapse.reload
        expect(synapse.desc).to eq 'My new description'
        expect(synapse.category).to eq 'both'
        expect(synapse.permission).to eq 'public'
      end

      it 'returns 204 NO CONTENT' do 
        put :update,
            { id: synapse.to_param, synapse: valid_attributes, format: :json }
        expect(response.status).to eq 204
      end
    end

    context 'with invalid params' do
      it 'assigns the synapse as @synapse' do
        put :update,
            { id: synapse.to_param, synapse: invalid_attributes, format: :json }
        expect(assigns(:synapse)).to eq(synapse)
      end
    end
  end

  describe 'DELETE #destroy' do
    let(:synapse) { create(:synapse, user: controller.current_user) }

    it 'destroys the requested synapse' do
      synapse.reload # ensure it's present
      expect do
        delete :destroy, { id: synapse.to_param, format: :json }
      end.to change(Synapse, :count).by(-1)
    end

    it 'returns 204 NO CONTENT' do
      delete :destroy, { id: synapse.to_param, format: :json }
      expect(response.status).to eq 204
    end
  end
end
