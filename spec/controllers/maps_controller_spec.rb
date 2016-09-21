require 'rails_helper'

RSpec.describe MapsController, type: :controller do
  let(:map) { create(:map) }
  let(:valid_attributes) { map.attributes.except(:id) }
  let(:invalid_attributes) { { permission: :commons } }
  before :each do
    sign_in create(:user)
  end

  describe 'POST #create' do
    context 'with valid params' do
      it 'creates a new Map' do
        expect do
          post :create, format: :json, params: {
            map: valid_attributes
          }
        end.to change(Map, :count).by(1)
      end

      it 'assigns a newly created map as @map' do
        post :create, format: :json, params: {
          map: valid_attributes
        }
        expect(Map.last).to eq map
      end
    end

    context 'with invalid params' do
      it 'assigns a newly created but unsaved map as @map' do
        post :create, format: :json, params: {
          map: invalid_attributes
        }
        expect(Map.count).to eq 0
      end
    end
  end

  describe 'PUT #update' do
    context 'with valid params' do
      let(:new_attributes) { { name: 'Uncool map', permission: :private } }

      it 'updates the requested map' do
        put :update, format: :json, params: {
          id: map.to_param, map: new_attributes
        }
        map.reload
        expect(map.name).to eq 'Uncool map'
        expect(map.permission).to eq 'private'
      end

      it 'assigns the requested map as @map' do
        put :update, format: :json, params: {
          id: map.to_param, map: valid_attributes
        }
        expect(Map.last).to eq map
      end
    end

    context 'with invalid params' do
      it 'assigns the map as @map' do
        put :update, format: :json, params: {
          id: map.to_param, map: invalid_attributes
        }
        expect(Map.last).to eq map
      end
    end
  end

  describe 'DELETE #destroy' do
    let(:unowned_map) { create(:map) }
    let(:owned_map) { create(:map, user: controller.current_user) }

    it 'prevents deletion by non-owners' do
      unowned_map.reload
      expect do
        delete :destroy, format: :json, params: {
          id: unowned_map.to_param
        }
      end.to change(Map, :count).by(0)
      expect(response.body).to eq ''
      expect(response.status).to eq 403
    end

    it 'deletes owned map' do
      owned_map.reload # ensure it's in the database
      expect do
        delete :destroy, format: :json, params: {
          id: owned_map.to_param
        }
      end.to change(Map, :count).by(-1)
      expect(response.body).to eq ''
      expect(response.status).to eq 204
    end
  end
end
