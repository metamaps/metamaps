require "rails_helper"

RSpec.describe MetacodesController, :type => :routing do
  describe "routing" do

    it "routes to #index" do
      expect(:get => "/metacodes").to route_to("metacodes#index")
    end

    it "routes to #new" do
      expect(:get => "/metacodes/new").to route_to("metacodes#new")
    end

    it "routes to #show" do
      expect(:get => "/metacodes/1").to route_to("metacodes#show", :id => "1")
    end

    it "routes to #edit" do
      expect(:get => "/metacodes/1/edit").to route_to("metacodes#edit", :id => "1")
    end

    it "routes to #create" do
      expect(:post => "/metacodes").to route_to("metacodes#create")
    end

    it "routes to #update via PUT" do
      expect(:put => "/metacodes/1").to route_to("metacodes#update", :id => "1")
    end

    it "routes to #destroy" do
      expect(:delete => "/metacodes/1").to route_to("metacodes#destroy", :id => "1")
    end

  end
end
