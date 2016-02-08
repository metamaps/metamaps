require 'rails_helper'

RSpec.describe TopicsController, type: :controller do
  let(:topic) { create(:topic) }
  let(:valid_attributes) { topic.attributes.except(:id) }
  let(:invalid_attributes) { { permission: :commons } } 
  before :each do
    sign_in
  end

  describe 'GET #show' do
    it 'assigns the requested topic as @topic' do
      get :show, { id: topic.to_param }
      expect(assigns(:topic)).to eq(topic)
    end
  end

  describe 'POST #create' do
    context 'with valid params' do
      it 'creates a new Topic' do
        expect do
          post :create, { topic: valid_attributes }
        end.to change(Topic, :count).by(1)
      end

      it 'assigns a newly created topic as @topic' do
        post :create, { topic: valid_attributes }
        expect(assigns(:topic)).to be_a(Topic)
        expect(assigns(:topic)).to be_persisted
      end

      it 'redirects to the created topic' do
        post :create, { topic: valid_attributes }
        expect(response).to redirect_to(Topic.last)
      end
    end

    context 'with invalid params' do
      it 'assigns a newly created but unsaved topic as @topic' do
        post :create, { topic: invalid_attributes }
        expect(assigns(:topic)).to be_a_new(Topic)
      end
    end
  end

  describe 'PUT #update' do
    context 'with valid params' do
      let(:new_attributes) do
        skip('Add a hash of attributes valid for your model')
      end

      it 'updates the requested topic' do
        put :update,
            { id: topic.to_param, topic: new_attributes }
        topic.reload
        skip('Add assertions for updated state')
      end

      it 'assigns the requested topic as @topic' do
        put :update,
            { id: topic.to_param, topic: valid_attributes }
        expect(assigns(:topic)).to eq(topic)
      end

      it 'redirects to the topic' do
        put :update,
            { id: topic.to_param, topic: valid_attributes }
        expect(response).to redirect_to(topic)
      end
    end

    context 'with invalid params' do
      it 'assigns the topic as @topic' do
        put :update,
            { id: topic.to_param, topic: invalid_attributes }
        expect(assigns(:topic)).to eq(topic)
      end
    end
  end

  describe 'DELETE #destroy' do
    it 'destroys the requested topic' do
      expect do
        delete :destroy, { id: topic.to_param }
      end.to change(Topic, :count).by(-1)
    end

    it 'redirects to the topics list' do
      delete :destroy, { id: topic.to_param }
      expect(response).to redirect_to(topics_url)
    end
  end
end
