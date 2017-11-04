# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'topics API', type: :request do
  let(:user) { create(:user, admin: true) }
  let(:token) { create(:token, user: user).token }
  let(:attachment) { create(:attachment) }

  it 'GET /api/v2/attachments' do
    create_list(:attachment, 5)
    get '/api/v2/attachments', params: { access_token: token }

    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:attachments)
    expect(JSON.parse(response.body)['data'].count).to eq 5
  end

  it 'GET /api/v2/attachments/:id' do
    get "/api/v2/attachments/#{attachment.id}"

    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:attachment)
    expect(JSON.parse(response.body)['data']['id']).to eq attachment.id
  end

  context 'RAML example' do
    let(:resource) { get_json_example(:attachment) }
    let(:collection) { get_json_example(:attachments) }

    it 'resource matches schema' do
      expect(resource).to match_json_schema(:attachment)
    end

    it 'collection matches schema' do
      expect(collection).to match_json_schema(:attachments)
    end
  end
end
