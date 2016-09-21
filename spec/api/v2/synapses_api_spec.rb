require 'rails_helper'

RSpec.describe 'synapses API', type: :request do
  let(:user) { create(:user, admin: true) }
  let(:token) { create(:token, user: user).token }
  let(:synapse) { create(:synapse, user: user) }

  it 'GET /api/v2/synapses' do
    create_list(:synapse, 5)
    get '/api/v2/synapses', params: { access_token: token }

    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:synapses)
    expect(JSON.parse(response.body)['data'].count).to eq 5
  end

  it 'GET /api/v2/synapses/:id' do
    get "/api/v2/synapses/#{synapse.id}"

    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:synapse)
    expect(JSON.parse(response.body)['data']['id']).to eq synapse.id
  end

  it 'POST /api/v2/synapses' do
    post '/api/v2/synapses', params: { synapse: synapse.attributes, access_token: token }

    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:synapse)
    expect(Synapse.count).to eq 2
  end

  it 'PATCH /api/v2/synapses/:id' do
    patch "/api/v2/synapses/#{synapse.id}", params: { synapse: synapse.attributes, access_token: token }

    expect(response).to have_http_status(:success)
    expect(response).to match_json_schema(:synapse)
  end

  it 'DELETE /api/v2/synapses/:id' do
    delete "/api/v2/synapses/#{synapse.id}", params: { access_token: token }

    expect(response).to have_http_status(:no_content)
    expect(Synapse.count).to eq 0
  end

  context 'RAML example' do
    let(:resource) { get_json_example(:synapse) }
    let(:collection) { get_json_example(:synapses) }

    it 'resource matches schema' do
      expect(resource).to match_json_schema(:synapse)
    end

    it 'collection matches schema' do
      expect(collection).to match_json_schema(:synapses)
    end
  end
end
