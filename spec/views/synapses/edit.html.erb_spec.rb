require 'rails_helper'

RSpec.describe "synapses/edit", :type => :view do
  before(:each) do
    @synapse = assign(:synapse, Synapse.create!())
  end

  it "renders the edit synapse form" do
    render

    assert_select "form[action=?][method=?]", synapse_path(@synapse), "post" do
    end
  end
end
