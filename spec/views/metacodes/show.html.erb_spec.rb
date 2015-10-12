require 'rails_helper'

RSpec.describe "metacodes/show", :type => :view do
  before(:each) do
    @metacode = assign(:metacode, Metacode.create!())
  end

  it "renders attributes in <p>" do
    render
  end
end
