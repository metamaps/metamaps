require 'rails_helper'

RSpec.describe SynapsesController, type: :routing do
  describe 'routing' do
    it 'routes to #show' do
      expect(get: '/synapses/1').to route_to('synapses#show', id: '1')
    end

    it 'routes to #create' do
      expect(post: '/synapses').to route_to('synapses#create')
    end

    it 'routes to #update via PUT' do
      expect(put: '/synapses/1').to route_to('synapses#update', id: '1')
    end

    it 'routes to #destroy' do
      expect(delete: '/synapses/1').to route_to('synapses#destroy', id: '1')
    end
  end
end
