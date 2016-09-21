require 'rails_helper'

RSpec.describe TopicsController, type: :controller do
  let(:topic) { create(:topic) }
  let(:valid_attributes) { topic.attributes.except('id') }
  let(:invalid_attributes) { { permission: :invalid_lol } }
  before :each do
    sign_in create(:user)
  end

  describe 'POST #create' do
    context 'with valid params' do
      it 'creates a new Topic' do
        topic.reload # ensure it's created
        expect do
          post :create, format: :json, params: {
            topic: valid_attributes
          }
        end.to change(Topic, :count).by(1)
      end

      it 'assigns a newly created topic as @topic' do
        post :create, format: :json, params: {
          topic: valid_attributes
        }
        expect(comparable(Topic.last)).to eq comparable(topic)
      end

      it 'returns 201 CREATED' do
        post :create, format: :json, params: {
          topic: valid_attributes
        }
        expect(response.status).to eq 201
      end
    end

    context 'with invalid params' do
      it 'assigns a newly created but unsaved topic as @topic' do
        post :create, format: :json, params: {
          topic: invalid_attributes
        }
        expect(Topic.count).to eq 0
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
        put :update, format: :json, params: {
          id: topic.to_param, topic: new_attributes
        }
        topic.reload
        expect(topic.name).to eq 'Cool Topic with no number'
        expect(topic.desc).to eq 'This is a cool topic.'
        expect(topic.link).to eq 'https://cool-topics.com/4'
        expect(topic.permission).to eq 'public'
      end

      it 'assigns the requested topic as @topic' do
        put :update, format: :json, params: {
          id: topic.to_param, topic: valid_attributes
        }
        expect(Topic.last).to eq(topic)
      end

      it 'returns status of no content' do
        put :update, format: :json, params: {
          id: topic.to_param, topic: valid_attributes
        }
        expect(response.status).to eq 204
      end
    end

    context 'with invalid params' do
      it 'assigns the topic as @topic' do
        put :update, format: :json, params: {
          id: topic.to_param, topic: invalid_attributes
        }
        expect(Topic.last).to eq topic
      end
    end
  end

  describe 'DELETE #destroy' do
    let(:owned_topic) { create(:topic, user: controller.current_user) }
    it 'destroys the requested topic' do
      owned_topic.reload # ensure it's there
      expect do
        delete :destroy, format: :json, params: {
          id: owned_topic.to_param
        }
      end.to change(Topic, :count).by(-1)
      expect(response.body).to eq ''
      expect(response.status).to eq 204
    end
  end
end
