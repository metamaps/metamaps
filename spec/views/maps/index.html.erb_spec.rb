require 'rails_helper'

RSpec.describe "maps/index", :type => :view do
  before(:each) do
    assign(:maps, [
      Map.create!(),
      Map.create!()
    ])
  end

  it "renders a list of maps" do
    render
  end
end
