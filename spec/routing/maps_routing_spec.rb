require "rails_helper"

RSpec.describe MapsController, :type => :routing do
  describe "routing" do

    it "routes to #index" do
      expect(:get => "/maps").to route_to("maps#index")
    end

    it "routes to #new" do
      expect(:get => "/maps/new").to route_to("maps#new")
    end

    it "routes to #show" do
      expect(:get => "/maps/1").to route_to("maps#show", :id => "1")
    end

    it "routes to #edit" do
      expect(:get => "/maps/1/edit").to route_to("maps#edit", :id => "1")
    end

    it "routes to #create" do
      expect(:post => "/maps").to route_to("maps#create")
    end

    it "routes to #update via PUT" do
      expect(:put => "/maps/1").to route_to("maps#update", :id => "1")
    end

    it "routes to #destroy" do
      expect(:delete => "/maps/1").to route_to("maps#destroy", :id => "1")
    end

  end
end
