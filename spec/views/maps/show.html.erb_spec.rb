require 'rails_helper'

RSpec.describe "maps/show", :type => :view do
  before(:each) do
    @map = assign(:map, Map.create!())
  end

  it "renders attributes in <p>" do
    render
  end
end
