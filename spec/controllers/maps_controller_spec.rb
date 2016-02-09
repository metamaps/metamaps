require 'rails_helper'

RSpec.describe MapsController, type: :controller do
  let(:map) { create(:map) }
  let(:valid_attributes) { map.attributes.except(:id) }
  let(:invalid_attributes) { { permission: :commons } } 
  before :each do
    sign_in
  end

  describe 'GET #index' do
    it 'assigns all maps as @maps' do
      get :index, {}
      expect(assigns(:maps)).to eq([map])
    end
  end

  describe 'GET #contains' do
    it 'returns json matching schema' do
      get :contains, { id: map.to_param, format: :json }
      # get "maps/#{map.id}/contains"
      expect(response.body).to match_json_schema(:map_contains)
    end
  end

  describe 'GET #show' do
    it 'assigns the requested map as @map' do
      get :show, { id: map.to_param }
      expect(assigns(:map)).to eq(map)
    end
  end

  describe 'POST #create' do
    context 'with valid params' do
      it 'creates a new Map' do
        expect do
          post :create, { map: valid_attributes }
        end.to change(Map, :count).by(1)
      end

      it 'assigns a newly created map as @map' do
        post :create, { map: valid_attributes }
        expect(assigns(:map)).to be_a(Map)
        expect(assigns(:map)).to be_persisted
      end

      it 'redirects to the created map' do
        post :create, { map: valid_attributes }
        expect(response).to redirect_to(Map.last)
      end
    end

    context 'with invalid params' do
      it 'assigns a newly created but unsaved map as @map' do
        post :create, { map: invalid_attributes }
        expect(assigns(:map)).to be_a_new(Map)
      end
    end
  end

  describe 'PUT #update' do
    context 'with valid params' do
      let(:new_attributes) do
        skip('Add a hash of attributes valid for your model')
      end

      it 'updates the requested map' do
        put :update,
            { id: map.to_param, map: new_attributes }
        map.reload
        skip('Add assertions for updated state')
      end

      it 'assigns the requested map as @map' do
        put :update,
            { id: map.to_param, map: valid_attributes }
        expect(assigns(:map)).to eq(map)
      end

      it 'redirects to the map' do
        put :update,
            { id: map.to_param, map: valid_attributes }
        expect(response).to redirect_to(map)
      end
    end

    context 'with invalid params' do
      it 'assigns the map as @map' do
        put :update,
            { id: map.to_param, map: invalid_attributes }
        expect(assigns(:map)).to eq(map)
      end
    end
  end

  describe 'DELETE #destroy' do
    it 'destroys the requested map' do
      expect do
        delete :destroy, { id: map.to_param }
      end.to change(Map, :count).by(-1)
    end

    it 'redirects to the maps list' do
      delete :destroy, { id: map.to_param }
      expect(response).to redirect_to(maps_url)
    end
  end
end
