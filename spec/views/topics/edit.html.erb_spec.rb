require 'rails_helper'

RSpec.describe "topics/edit", :type => :view do
  before(:each) do
    @topic = assign(:topic, Topic.create!())
  end

  it "renders the edit topic form" do
    render

    assert_select "form[action=?][method=?]", topic_path(@topic), "post" do
    end
  end
end
