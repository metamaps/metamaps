require 'rails_helper'

RSpec.describe SynapsesController, type: :controller do
  let(:synapse) { create(:synapse) }
  let(:valid_attributes) { synapse.attributes.except('id') }
  let(:invalid_attributes) { { permission: :invalid_lol } }
  before :each do
    sign_in create(:user)
  end

  describe 'POST #create' do
    context 'with valid params' do
      it 'creates a new Synapse' do
        synapse.reload # ensure it's present
        expect do
          post :create, format: :json, params: {
            synapse: valid_attributes
          }
        end.to change(Synapse, :count).by(1)
      end

      it 'assigns a newly created synapse as @synapse' do
        post :create, format: :json, params: {
          synapse: valid_attributes
        }
        expect(comparable(Synapse.last)).to eq comparable(synapse)
      end

      it 'returns 201 CREATED' do
        post :create, format: :json, params: {
          synapse: valid_attributes
        }
        expect(response.status).to eq 201
      end
    end

    context 'with invalid params' do
      it 'returns 422 UNPROCESSABLE ENTITY' do
        post :create, format: :json, params: {
          synapse: invalid_attributes
        }
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
        put :update, format: :json, params: {
          id: synapse.to_param, synapse: new_attributes
        }
        synapse.reload
        expect(synapse.desc).to eq 'My new description'
        expect(synapse.category).to eq 'both'
        expect(synapse.permission).to eq 'public'
      end

      it 'returns 204 NO CONTENT' do
        put :update, format: :json, params: {
          id: synapse.to_param, synapse: valid_attributes
        }
        expect(response.status).to eq 204
      end
    end

    context 'with invalid params' do
      it 'assigns the synapse as @synapse' do
        put :update, format: :json, params: {
          id: synapse.to_param, synapse: invalid_attributes
        }
        expect(Synapse.last).to eq synapse
      end
    end
  end

  describe 'DELETE #destroy' do
    let(:synapse) { create(:synapse, user: controller.current_user) }

    it 'destroys the requested synapse' do
      synapse.reload # ensure it's present
      expect do
        delete :destroy, format: :json, params: {
          id: synapse.to_param
        }
      end.to change(Synapse, :count).by(-1)
    end

    it 'returns 204 NO CONTENT' do
      delete :destroy, format: :json, params: {
        id: synapse.to_param
      }
      expect(response.status).to eq 204
    end
  end
end
