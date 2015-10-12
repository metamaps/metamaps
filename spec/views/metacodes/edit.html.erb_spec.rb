require 'rails_helper'

RSpec.describe "metacodes/edit", :type => :view do
  before(:each) do
    @metacode = assign(:metacode, Metacode.create!())
  end

  it "renders the edit metacode form" do
    render

    assert_select "form[action=?][method=?]", metacode_path(@metacode), "post" do
    end
  end
end
