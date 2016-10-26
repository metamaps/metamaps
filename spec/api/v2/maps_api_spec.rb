# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'maps API', type: :request do
  let(:user) { create(:user, admin: true) }
  let(:token) { create(:token, user: user).token }
  let(:map) { create(:map, user: user) }

  it 'GET /api/v2/maps' do
    create_list(:map, 5)
    get '/api/v2/maps'

    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:maps)
    expect(JSON.parse(response.body)['data'].count).to eq 5
  end

  it 'GET /api/v2/maps/:id' do
    get "/api/v2/maps/#{map.id}"

    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:map)
    expect(JSON.parse(response.body)['data']['id']).to eq map.id
  end
  
  it 'POST /api/v2/maps' do
    post '/api/v2/maps', params: { map: map.attributes, access_token: token }

    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:map)
    expect(Map.count).to eq 2
  end

  it 'PATCH /api/v2/maps/:id' do
    patch "/api/v2/maps/#{map.id}", params: { map: map.attributes, access_token: token }

    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:map)
  end

  it 'DELETE /api/v2/maps/:id' do
    delete "/api/v2/maps/#{map.id}", params: { access_token: token }

    expect(response).to have_http_status(:no_content)
    expect(Map.count).to eq 0
  end

  it 'POST /api/v2/maps/:id/stars' do
    post "/api/v2/maps/#{map.id}/stars", params: { access_token: token }
    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:map)
    expect(user.stars.count).to eq 1
    expect(map.stars.count).to eq 1
  end

  it 'DELETE /api/v2/maps/:id/stars' do
    create(:star, map: map, user: user)
    delete "/api/v2/maps/#{map.id}/stars", params: { access_token: token }

    expect(response).to have_http_status(:no_content)
    expect(user.stars.count).to eq 0
    expect(map.stars.count).to eq 0
  end

  context 'RAML example' do
    let(:resource) { get_json_example(:map) }
    let(:collection) { get_json_example(:maps) }

    it 'resource matches schema' do
      expect(resource).to match_json_schema(:map)
    end

    it 'collection matches schema' do
      expect(collection).to match_json_schema(:maps)
    end
  end
end
