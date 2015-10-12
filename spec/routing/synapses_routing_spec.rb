require "rails_helper"

RSpec.describe SynapsesController, :type => :routing do
  describe "routing" do

    it "routes to #index" do
      expect(:get => "/synapses").to route_to("synapses#index")
    end

    it "routes to #new" do
      expect(:get => "/synapses/new").to route_to("synapses#new")
    end

    it "routes to #show" do
      expect(:get => "/synapses/1").to route_to("synapses#show", :id => "1")
    end

    it "routes to #edit" do
      expect(:get => "/synapses/1/edit").to route_to("synapses#edit", :id => "1")
    end

    it "routes to #create" do
      expect(:post => "/synapses").to route_to("synapses#create")
    end

    it "routes to #update via PUT" do
      expect(:put => "/synapses/1").to route_to("synapses#update", :id => "1")
    end

    it "routes to #destroy" do
      expect(:delete => "/synapses/1").to route_to("synapses#destroy", :id => "1")
    end

  end
end
