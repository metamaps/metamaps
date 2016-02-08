require 'rails_helper'

RSpec.describe SynapsesController, type: :controller do
  let(:synapse) { create(:synapse) }
  let(:valid_attributes) { synapse.attributes.except(:id) }
  let(:invalid_attributes) { { permission: :commons } } 
  before :each do
    sign_in
  end

  describe 'GET #index' do
    it 'assigns all synapses as @synapses' do
      get :index, {}
      expect(assigns(:synapses)).to eq([synapse])
    end
  end

  describe 'GET #show' do
    it 'assigns the requested synapse as @synapse' do
      get :show, { id: synapse.to_param }
      expect(assigns(:synapse)).to eq(synapse)
    end
  end

  describe 'GET #edit' do
    it 'assigns the requested synapse as @synapse' do
      get :edit, { id: synapse.to_param }
      expect(assigns(:synapse)).to eq(synapse)
    end
  end

  describe 'POST #create' do
    context 'with valid params' do
      it 'creates a new Synapse' do
        expect do
          post :create, { synapse: valid_attributes }
        end.to change(Synapse, :count).by(1)
      end

      it 'assigns a newly created synapse as @synapse' do
        post :create, { synapse: valid_attributes }
        expect(assigns(:synapse)).to be_a(Synapse)
        expect(assigns(:synapse)).to be_persisted
      end

      it 'redirects to the created synapse' do
        post :create, { synapse: valid_attributes }
        expect(response).to redirect_to(Synapse.last)
      end
    end

    context 'with invalid params' do
      it 'assigns a newly created but unsaved synapse as @synapse' do
        post :create, { synapse: invalid_attributes }
        expect(assigns(:synapse)).to be_a_new(Synapse)
      end

      it "re-renders the 'new' template" do
        post :create, { synapse: invalid_attributes }
        expect(response).to render_template('new')
      end
    end
  end

  describe 'PUT #update' do
    context 'with valid params' do
      let(:new_attributes) do
        skip('Add a hash of attributes valid for your model')
      end

      it 'updates the requested synapse' do
        put :update,
            { id: synapse.to_param, synapse: new_attributes }
        synapse.reload
        skip('Add assertions for updated state')
      end

      it 'assigns the requested synapse as @synapse' do
        put :update,
            { id: synapse.to_param, synapse: valid_attributes }
        expect(assigns(:synapse)).to eq(synapse)
      end

      it 'redirects to the synapse' do
        put :update,
            { id: synapse.to_param, synapse: valid_attributes }
        expect(response).to redirect_to(synapse)
      end
    end

    context 'with invalid params' do
      it 'assigns the synapse as @synapse' do
        put :update,
            { id: synapse.to_param, synapse: invalid_attributes }
        expect(assigns(:synapse)).to eq(synapse)
      end

      it "re-renders the 'edit' template" do
        put :update,
            { id: synapse.to_param, synapse: invalid_attributes }
        expect(response).to render_template('edit')
      end
    end
  end

  describe 'DELETE #destroy' do
    it 'destroys the requested synapse' do
      expect do
        delete :destroy, { id: synapse.to_param }
      end.to change(Synapse, :count).by(-1)
    end

    it 'redirects to the synapses list' do
      delete :destroy, { id: synapse.to_param }
      expect(response).to redirect_to(synapses_url)
    end
  end
end
