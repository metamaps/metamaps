require 'rails_helper'

RSpec.describe MapsController, type: :controller do
  let(:map) { create(:map) }
  let(:valid_attributes) { map.attributes.except(:id) }
  let(:invalid_attributes) { { permission: :commons } } 
  before :each do
    sign_in
  end

  describe 'GET #index' do
    it 'viewable maps as @maps' do
      get :index, {}
      expect(assigns(:maps)).to eq([map])
    end
  end

  describe 'GET #contains' do
    it 'returns json matching schema' do
      get :contains, { id: map.to_param, format: :json }
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
        map.reload
        expect do
          post :create, valid_attributes.merge(format: :json)
        end.to change(Map, :count).by(1)
      end

      it 'assigns a newly created map as @map' do
        post :create, valid_attributes.merge(format: :json)
        expect(assigns(:map)).to be_a(Map)
        expect(assigns(:map)).to be_persisted
      end
    end

    context 'with invalid params' do
      it 'assigns a newly created but unsaved map as @map' do
        post :create, invalid_attributes.merge(format: :json)
        expect(assigns(:map)).to be_a_new(Map)
      end
    end
  end

  describe 'PUT #update' do
    context 'with valid params' do
      let(:new_attributes) { { name: "Uncool map", permission: :private } }

      it 'updates the requested map' do
        put :update,
            { id: map.to_param, map: new_attributes, format: :json }
        expect(assigns(:map).name).to eq "Uncool map"
        expect(assigns(:map).permission).to eq 'private'
      end

      it 'assigns the requested map as @map' do
        put :update,
            { id: map.to_param, map: valid_attributes, format: :json }
        expect(assigns(:map)).to eq(map)
      end
    end

    context 'with invalid params' do
      it 'assigns the map as @map' do
        put :update,
            { id: map.to_param, map: invalid_attributes, format: :json }
        expect(assigns(:map)).to eq(map)
      end
    end
  end

  describe 'DELETE #destroy' do
    let(:unowned_map) { create(:map) }
    let(:owned_map) { create(:map, user: controller.current_user) }

    it 'prevents deletion by non-owners' do
      unowned_map.reload
      expect do
        delete :destroy, { id: unowned_map.to_param, format: :json }
      end.to change(Map, :count).by(0)
      expect(response.body).to eq("unauthorized")
    end

    it 'deletes owned map' do
      owned_map.reload # ensure it's in the database
      expect do
        delete :destroy, { id: owned_map.to_param, format: :json }
      end.to change(Map, :count).by(-1)
      expect(response.body).to eq("success")
    end
  end
end
