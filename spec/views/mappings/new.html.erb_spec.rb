require 'rails_helper'

RSpec.describe "mappings/new", :type => :view do
  before(:each) do
    assign(:mapping, Mapping.new())
  end

  it "renders new mapping form" do
    render

    assert_select "form[action=?][method=?]", mappings_path, "post" do
    end
  end
end
