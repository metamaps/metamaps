require 'rails_helper'

RSpec.describe TopicsController, type: :controller do
  let(:valid_attributes) do
    skip('Add a hash of attributes valid for your model')
  end

  let(:invalid_attributes) do
    skip('Add a hash of attributes invalid for your model')
  end

  let(:valid_session) { {} }

  describe 'GET #index' do
    it 'assigns all topics as @topics' do
      topic = Topic.create! valid_attributes
      get :index, {}, valid_session
      expect(assigns(:topics)).to eq([topic])
    end
  end

  describe 'GET #show' do
    it 'assigns the requested topic as @topic' do
      topic = Topic.create! valid_attributes
      get :show, { id: topic.to_param }, valid_session
      expect(assigns(:topic)).to eq(topic)
    end
  end

  describe 'GET #edit' do
    it 'assigns the requested topic as @topic' do
      topic = Topic.create! valid_attributes
      get :edit, { id: topic.to_param }, valid_session
      expect(assigns(:topic)).to eq(topic)
    end
  end

  describe 'POST #create' do
    context 'with valid params' do
      it 'creates a new Topic' do
        expect do
          post :create, { topic: valid_attributes }, valid_session
        end.to change(Topic, :count).by(1)
      end

      it 'assigns a newly created topic as @topic' do
        post :create, { topic: valid_attributes }, valid_session
        expect(assigns(:topic)).to be_a(Topic)
        expect(assigns(:topic)).to be_persisted
      end

      it 'redirects to the created topic' do
        post :create, { topic: valid_attributes }, valid_session
        expect(response).to redirect_to(Topic.last)
      end
    end

    context 'with invalid params' do
      it 'assigns a newly created but unsaved topic as @topic' do
        post :create, { topic: invalid_attributes }, valid_session
        expect(assigns(:topic)).to be_a_new(Topic)
      end

      it "re-renders the 'new' template" do
        post :create, { topic: invalid_attributes }, valid_session
        expect(response).to render_template('new')
      end
    end
  end

  describe 'PUT #update' do
    context 'with valid params' do
      let(:new_attributes) do
        skip('Add a hash of attributes valid for your model')
      end

      it 'updates the requested topic' do
        topic = Topic.create! valid_attributes
        put :update,
            { id: topic.to_param, topic: new_attributes },
            valid_session
        topic.reload
        skip('Add assertions for updated state')
      end

      it 'assigns the requested topic as @topic' do
        topic = Topic.create! valid_attributes
        put :update,
            { id: topic.to_param, topic: valid_attributes },
            valid_session
        expect(assigns(:topic)).to eq(topic)
      end

      it 'redirects to the topic' do
        topic = Topic.create! valid_attributes
        put :update,
            { id: topic.to_param, topic: valid_attributes },
            valid_session
        expect(response).to redirect_to(topic)
      end
    end

    context 'with invalid params' do
      it 'assigns the topic as @topic' do
        topic = Topic.create! valid_attributes
        put :update,
            { id: topic.to_param, topic: invalid_attributes },
            valid_session
        expect(assigns(:topic)).to eq(topic)
      end

      it "re-renders the 'edit' template" do
        topic = Topic.create! valid_attributes
        put :update,
            { id: topic.to_param, topic: invalid_attributes },
            valid_session
        expect(response).to render_template('edit')
      end
    end
  end

  describe 'DELETE #destroy' do
    it 'destroys the requested topic' do
      topic = Topic.create! valid_attributes
      expect do
        delete :destroy, { id: topic.to_param }, valid_session
      end.to change(Topic, :count).by(-1)
    end

    it 'redirects to the topics list' do
      topic = Topic.create! valid_attributes
      delete :destroy, { id: topic.to_param }, valid_session
      expect(response).to redirect_to(topics_url)
    end
  end
end
