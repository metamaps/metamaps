require 'rails_helper'

RSpec.describe "synapses/new", :type => :view do
  before(:each) do
    assign(:synapse, Synapse.new())
  end

  it "renders new synapse form" do
    render

    assert_select "form[action=?][method=?]", synapses_path, "post" do
    end
  end
end
