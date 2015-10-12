require 'rails_helper'

RSpec.describe "topics/index", :type => :view do
  before(:each) do
    assign(:topics, [
      Topic.create!(),
      Topic.create!()
    ])
  end

  it "renders a list of topics" do
    render
  end
end
