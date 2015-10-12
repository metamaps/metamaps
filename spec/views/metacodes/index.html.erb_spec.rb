require 'rails_helper'

RSpec.describe "metacodes/index", :type => :view do
  before(:each) do
    assign(:metacodes, [
      Metacode.create!(),
      Metacode.create!()
    ])
  end

  it "renders a list of metacodes" do
    render
  end
end
