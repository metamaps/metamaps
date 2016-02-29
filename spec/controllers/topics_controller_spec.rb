require 'rails_helper'

RSpec.describe TopicsController, type: :controller do
  let(:topic) { create(:topic) }
  let(:valid_attributes) { topic.attributes.except('id') }
  let(:invalid_attributes) { { permission: :invalid_lol } }
  before :each do
    sign_in
  end

  describe 'GET #show' do
    it 'assigns the requested topic as @topic' do
      get :show, { id: topic.to_param, format: :json }
      expect(assigns(:topic)).to eq(topic)
    end
  end

  describe 'POST #create' do
    context 'with valid params' do
      it 'creates a new Topic' do
        topic.reload # ensure it's created
        expect do
          post :create, { topic: valid_attributes, format: :json }
        end.to change(Topic, :count).by(1)
      end

      it 'assigns a newly created topic as @topic' do
        post :create, { topic: valid_attributes, format: :json }
        expect(assigns(:topic)).to be_a(Topic)
        expect(assigns(:topic)).to be_persisted
      end

      it 'returns 201 CREATED' do 
        post :create, { topic: valid_attributes, format: :json }
        expect(response.status).to eq 201
      end
    end

    context 'with invalid params' do
      it 'assigns a newly created but unsaved topic as @topic' do
        post :create, { topic: invalid_attributes, format: :json }
        expect(assigns(:topic)).to be_a_new(Topic)
      end
    end
  end

  describe 'PUT #update' do
    context 'with valid params' do
      let(:new_attributes) do
        { name: 'Cool Topic with no number',
          desc: 'This is a cool topic.',
          link: 'https://cool-topics.com/4',
          permission: :public }
      end

      it 'updates the requested topic' do
        put :update,
            { id: topic.to_param, topic: new_attributes, format: :json }
        topic.reload
        expect(topic.name).to eq 'Cool Topic with no number'
        expect(topic.desc).to eq 'This is a cool topic.'
        expect(topic.link).to eq 'https://cool-topics.com/4'
        expect(topic.permission).to eq 'public'
      end

      it 'assigns the requested topic as @topic' do
        put :update,
            { id: topic.to_param, topic: valid_attributes, format: :json }
        expect(assigns(:topic)).to eq(topic)
      end

      it 'returns status of no content' do 
        put :update,
            { id: topic.to_param, topic: valid_attributes, format: :json }
        expect(response.status).to eq 204
      end
    end

    context 'with invalid params' do
      it 'assigns the topic as @topic' do
        put :update,
            { id: topic.to_param, topic: invalid_attributes, format: :json }
        expect(assigns(:topic)).to eq(topic)
      end
    end
  end

  describe 'DELETE #destroy' do
    let(:owned_topic) { create(:topic, user: controller.current_user) }
    it 'destroys the requested topic' do
      owned_topic.reload # ensure it's there
      expect do
        delete :destroy, { id: owned_topic.to_param, format: :json }
      end.to change(Topic, :count).by(-1)
    end

    it 'return 204 NO CONTENT' do 
      delete :destroy, { id: topic.to_param, format: :json }
      expect(response.status).to eq 204
    end
  end
end
