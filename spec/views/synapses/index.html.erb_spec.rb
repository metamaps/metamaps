require 'rails_helper'

RSpec.describe "synapses/index", :type => :view do
  before(:each) do
    assign(:synapses, [
      Synapse.create!(),
      Synapse.create!()
    ])
  end

  it "renders a list of synapses" do
    render
  end
end
