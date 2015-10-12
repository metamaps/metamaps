require 'rails_helper'

RSpec.describe "topics/new", :type => :view do
  before(:each) do
    assign(:topic, Topic.new())
  end

  it "renders new topic form" do
    render

    assert_select "form[action=?][method=?]", topics_path, "post" do
    end
  end
end
