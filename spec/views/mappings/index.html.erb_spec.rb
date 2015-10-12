require 'rails_helper'

RSpec.describe "mappings/index", :type => :view do
  before(:each) do
    assign(:mappings, [
      Mapping.create!(),
      Mapping.create!()
    ])
  end

  it "renders a list of mappings" do
    render
  end
end
