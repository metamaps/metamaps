require 'rails_helper'

RSpec.describe "topics/show", :type => :view do
  before(:each) do
    @topic = assign(:topic, Topic.create!())
  end

  it "renders attributes in <p>" do
    render
  end
end
