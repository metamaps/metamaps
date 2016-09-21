require 'rails_helper'

RSpec.describe 'mappings API', type: :request do
  let(:user) { create(:user, admin: true) }
  let(:token) { create(:token, user: user).token }
  let(:mapping) { create(:mapping, user: user) }

  it 'GET /api/v2/mappings' do
    create_list(:mapping, 5)
    get '/api/v2/mappings', params: { access_token: token }

    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:mappings)
    expect(JSON.parse(response.body)['data'].count).to eq 5
  end

  it 'GET /api/v2/mappings/:id' do
    get "/api/v2/mappings/#{mapping.id}"

    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:mapping)
    expect(JSON.parse(response.body)['data']['id']).to eq mapping.id
  end

  it 'POST /api/v2/mappings' do
    post '/api/v2/mappings', params: { mapping: mapping.attributes, access_token: token }

    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:mapping)
    expect(Mapping.count).to eq 2
  end

  it 'PATCH /api/v2/mappings/:id' do
    patch "/api/v2/mappings/#{mapping.id}", params: { mapping: mapping.attributes, access_token: token }

    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:mapping)
  end

  it 'DELETE /api/v2/mappings/:id' do
    delete "/api/v2/mappings/#{mapping.id}", params: { access_token: token }

    expect(response).to have_http_status(:no_content)
    expect(Mapping.count).to eq 0
  end

  context 'RAML example' do
    let(:resource) { get_json_example(:mapping) }
    let(:collection) { get_json_example(:mappings) }

    it 'resource matches schema' do
      expect(resource).to match_json_schema(:mapping)
    end

    it 'collection matches schema' do
      expect(collection).to match_json_schema(:mappings)
    end
  end
end
