require 'rails_helper'

RSpec.describe "metacodes/new", :type => :view do
  before(:each) do
    assign(:metacode, Metacode.new())
  end

  it "renders new metacode form" do
    render

    assert_select "form[action=?][method=?]", metacodes_path, "post" do
    end
  end
end
