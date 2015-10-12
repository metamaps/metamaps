require 'rails_helper'

RSpec.describe "mappings/edit", :type => :view do
  before(:each) do
    @mapping = assign(:mapping, Mapping.create!())
  end

  it "renders the edit mapping form" do
    render

    assert_select "form[action=?][method=?]", mapping_path(@mapping), "post" do
    end
  end
end
