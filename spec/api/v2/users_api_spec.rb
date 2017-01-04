# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'users API', type: :request do
  let(:user) { create(:user, admin: true) }
  let(:token) { create(:token, user: user).token }
  let(:record) { create(:user) }

  it 'GET /api/v2/users' do
    create_list(:user, 5)
    get '/api/v2/users', params: { access_token: token }

    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:users)
    expect(JSON.parse(response.body)['data'].count).to eq 6
  end

  it 'GET /api/v2/users/:id' do
    get "/api/v2/users/#{record.id}", params: { access_token: token }

    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:user)
    expect(JSON.parse(response.body)['data']['id']).to eq record.id
  end

  it 'GET /api/v2/users/current' do
    get '/api/v2/users/current', params: { access_token: token }

    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:user)
    expect(JSON.parse(response.body)['data']['id']).to eq user.id
  end

  context 'RAML example' do
    let(:resource) { get_json_example(:user) }
    let(:collection) { get_json_example(:users) }
    let(:current) { get_json_example(:current_user) }

    it 'resource matches schema' do
      expect(resource).to match_json_schema(:user)
    end

    it 'collection matches schema' do
      expect(collection).to match_json_schema(:users)
    end

    it 'current_user resource matches schema' do
      expect(current).to match_json_schema(:current_user)
    end
  end
end
