# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'metacodes API', type: :request do
  let(:user) { create(:user, admin: true) }
  let(:token) { create(:token, user: user).token }
  let(:metacode) { create(:metacode) }

  it 'GET /api/v2/metacodes' do
    create_list(:metacode, 5)
    get '/api/v2/metacodes', params: { access_token: token }

    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:metacodes)
    expect(JSON.parse(response.body)['data'].count).to eq 5
  end

  it 'GET /api/v2/metacodes/:id' do
    get "/api/v2/metacodes/#{metacode.id}", params: { access_token: token }

    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:metacode)
    expect(JSON.parse(response.body)['data']['id']).to eq metacode.id
  end
end
