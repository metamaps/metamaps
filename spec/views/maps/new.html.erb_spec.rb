require 'rails_helper'

RSpec.describe "maps/new", :type => :view do
  before(:each) do
    assign(:map, Map.new())
  end

  it "renders new map form" do
    render

    assert_select "form[action=?][method=?]", maps_path, "post" do
    end
  end
end
