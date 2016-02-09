require 'rails_helper'

RSpec.describe MetacodesController, type: :controller do
  let(:metacode) { create(:metacode) }
  let(:valid_attributes) { metacode.attributes.except(:id) }
  let(:invalid_attributes) { { permission: :commons } } 
  before :each do
    sign_in
  end

  describe 'GET #index' do
    it 'assigns all metacodes as @metacodes' do
      get :index, {}
      expect(assigns(:metacodes).to_a).to eq([metacode])
    end
  end

  describe 'GET #new' do
    it 'assigns a new metacode as @metacode' do
      get :new, {}
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
        expect do
          post :create, { metacode: valid_attributes }
        end.to change(Metacode, :count).by(1)
      end

      it 'assigns a newly created metacode as @metacode' do
        post :create, { metacode: valid_attributes }
        expect(assigns(:metacode)).to be_a(Metacode)
        expect(assigns(:metacode)).to be_persisted
      end

      it 'redirects to the created metacode' do
        post :create, { metacode: valid_attributes }
        expect(response).to redirect_to(Metacode.last)
      end
    end

    context 'with invalid params' do
      it 'assigns a newly created but unsaved metacode as @metacode' do
        post :create, { metacode: invalid_attributes }
        expect(assigns(:metacode)).to be_a_new(Metacode)
      end

      it "re-renders the 'new' template" do
        post :create, { metacode: invalid_attributes }
        expect(response).to render_template('new')
      end
    end
  end

  describe 'PUT #update' do
    context 'with valid params' do
      let(:new_attributes) do
        skip('Add a hash of attributes valid for your model')
      end

      it 'updates the requested metacode' do
        put :update,
            { id: metacode.to_param, metacode: new_attributes }
        metacode.reload
        skip('Add assertions for updated state')
      end

      it 'assigns the requested metacode as @metacode' do
        put :update,
            { id: metacode.to_param, metacode: valid_attributes }
        expect(assigns(:metacode)).to eq(metacode)
      end

      it 'redirects to the metacode' do
        put :update,
            { id: metacode.to_param, metacode: valid_attributes }
        expect(response).to redirect_to(metacode)
      end
    end

    context 'with invalid params' do
      it 'redirects to edit template' do
        put :update,
            { id: metacode.to_param, metacode: invalid_attributes }
        expect(response.status).to eq 302
      end
    end
  end
end
