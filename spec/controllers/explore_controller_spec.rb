# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ExploreController, type: :controller do
  before :each do
    sign_in create(:user)
  end

  describe 'GET explore/active' do
    context 'always returns an array' do
      it 'with 0 records' do
        Map.delete_all
        get :active, format: :json
        expect(JSON.parse(response.body)).to eq []
      end
      it 'with 1 record' do
        create(:map)
        get :active, format: :json
        expect(JSON.parse(response.body).class).to be Array
      end
    end
  end
end
