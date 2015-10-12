require 'rails_helper'

RSpec.describe "synapses/show", :type => :view do
  before(:each) do
    @synapse = assign(:synapse, Synapse.create!())
  end

  it "renders attributes in <p>" do
    render
  end
end
