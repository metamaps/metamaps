require 'rails_helper'

RSpec.describe "mappings/show", :type => :view do
  before(:each) do
    @mapping = assign(:mapping, Mapping.create!())
  end

  it "renders attributes in <p>" do
    render
  end
end
