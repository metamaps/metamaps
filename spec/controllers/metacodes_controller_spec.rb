require 'rails_helper'

RSpec.describe MetacodesController, type: :controller do
  let(:metacode) { create(:metacode) }
  let(:valid_attributes) { metacode.attributes.except('id') }
  before :each do
    sign_in create(:user, admin: true)
  end

  describe 'GET #index' do
    it 'assigns all metacodes as @metacodes' do
      metacode.reload # ensure it's created
      get :index, {}
      expect(Metacode.all.to_a).to eq([metacode])
    end
  end

  describe 'GET #new' do
    it 'assigns a new metacode as @metacode' do
      get :new, { format: :json }
      expect(assigns(:metacode)).to be_a_new(Metacode)
    end
  end

  describe 'GET #edit' do
    it 'assigns the requested metacode as @metacode' do
      get :edit, { id: metacode.to_param }
      expect(assigns(:metacode)).to eq(metacode)
    end
  end

  describe 'POST #create' do
    context 'with valid params' do
      it 'creates a new Metacode' do
        metacode.reload # ensure it's present to start
        expect do
          post :create, { metacode: valid_attributes }
        end.to change(Metacode, :count).by(1)
      end

      it 'has the correct attributes' do
        post :create, { metacode: valid_attributes }
        # expect(Metacode.last.attributes.expect(:id)).to eq(metacode.attributes.except(:id))
        expect(assigns(:metacode)).to be_a(Metacode)
        expect(assigns(:metacode)).to be_persisted
      end

      it 'redirects to the metacode index' do
        post :create, { metacode: valid_attributes }
        expect(response).to redirect_to(metacodes_url)
      end
    end
  end

  describe 'PUT #update' do
    context 'with valid params' do
      let(:new_attributes) do
        { icon: 'https://newimages.ca/cool-image.jpg',
          color: '#ffffff',
          name: 'Cognition' }
      end

      it 'updates the requested metacode' do
        put :update,
            { id: metacode.to_param, metacode: new_attributes }
        metacode.reload
        expect(metacode.icon).to eq 'https://newimages.ca/cool-image.jpg'
        expect(metacode.color).to eq '#ffffff'
        expect(metacode.name).to eq 'Cognition'
      end
    end
  end

  context 'not admin' do
    it 'denies access to create' do
      sign_in create(:user, admin: false)
      post :create, { metacode: valid_attributes }
      expect(response).to redirect_to root_url
    end

    it 'denies access to update' do
      sign_in create(:user, admin: false)
      post :update, { id: metacode.to_param, metacode: valid_attributes }
      expect(response).to redirect_to root_url
    end
  end
end
