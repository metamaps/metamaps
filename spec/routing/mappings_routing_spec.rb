require "rails_helper"

RSpec.describe MappingsController, :type => :routing do
  describe "routing" do

    it "routes to #index" do
      expect(:get => "/mappings").to route_to("mappings#index")
    end

    it "routes to #new" do
      expect(:get => "/mappings/new").to route_to("mappings#new")
    end

    it "routes to #show" do
      expect(:get => "/mappings/1").to route_to("mappings#show", :id => "1")
    end

    it "routes to #edit" do
      expect(:get => "/mappings/1/edit").to route_to("mappings#edit", :id => "1")
    end

    it "routes to #create" do
      expect(:post => "/mappings").to route_to("mappings#create")
    end

    it "routes to #update via PUT" do
      expect(:put => "/mappings/1").to route_to("mappings#update", :id => "1")
    end

    it "routes to #destroy" do
      expect(:delete => "/mappings/1").to route_to("mappings#destroy", :id => "1")
    end

  end
end
