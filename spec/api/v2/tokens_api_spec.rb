require 'rails_helper'

RSpec.describe 'tokens API', type: :request do
  let(:user) { create(:user, admin: true) }
  let(:auth_token) { create(:token, user: user).token }
  let(:token) { create(:token, user: user) }

  it 'GET /api/v2/tokens/my_tokens' do
    create_list(:token, 5, user: user)
    get '/api/v2/tokens/my_tokens', params: { access_token: auth_token }

    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:tokens)
    expect(Token.count).to eq 6 # 5 + the extra auth token; let(:token) wasn't used
  end

  it 'POST /api/v2/tokens' do
    post '/api/v2/tokens', params: { token: token.attributes, access_token: auth_token }

    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:token)
    expect(Token.count).to eq 3 # auth_token, token, and the new POST-ed token
  end

  it 'DELETE /api/v2/tokens/:id' do
    delete "/api/v2/tokens/#{token.id}", params: { access_token: auth_token }

    expect(response).to have_http_status(:no_content)
    expect(Token.count).to eq 1 # the extra auth token
  end

  context 'RAML example' do
    let(:resource) { get_json_example(:token) }
    let(:collection) { get_json_example(:tokens) }

    it 'resource matches schema' do
      expect(resource).to match_json_schema(:token)
    end

    it 'collection matches schema' do
      expect(collection).to match_json_schema(:tokens)
    end
  end
end
