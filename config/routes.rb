ISSAD::Application.routes.draw do

  root to: 'main#home', via: :get
  
  match 'request', to: 'main#requestinvite', via: :get, as: :request
  
  match 'invite', to: 'main#invite', via: :get, as: :invite
  
  match '/search/topics', to: 'main#searchtopics', via: :get, as: :searchtopics
  match '/search/maps', to: 'main#searchmaps', via: :get, as: :searchmaps
  match '/search/mappers', to: 'main#searchmappers', via: :get, as: :searchmappers
  
  match 'maps/:id/savelayout', to: 'maps#savelayout', via: :put, as: :savelayout
  match 'topics/:map_id/:topic_id/removefrommap', to: 'topics#removefrommap', via: :post, as: :removefrommap
  match 'synapses/:map_id/:synapse_id/removefrommap', to: 'synapses#removefrommap', via: :post, as: :removefrommap
  
  resources :topics do
    get :autocomplete_topic, :on => :collection
  end
  match 'topics/:id/:format', to: 'topics#json', via: :get, as: :json
  
  resources :synapses do
    get :autocomplete_synapse_desc, :on => :collection
  end
  match 'synapses/:id/:format', to: 'synapses#json', via: :get, as: :json
  
  resources :maps do
    get :autocomplete_map_name, :on => :collection
  end
  match 'maps/:id/embed', to: 'maps#embed', via: :get, as: :embed
  match 'maps/:id/:format', to: 'maps#json', via: :get, as: :json
  
  devise_for :users, :path_names => { :sign_in => 'login', :sign_out => 'logout' }
  devise_scope :user do
    get "sign_out", :to => "devise/sessions#destroy"
  end
  
  resources :users, except: :show do
    get :autocomplete_user_name, :on => :collection
	  resources :topics, :only => [:index]
    resources :synapses, :only => [:index]
	  resources :maps, :only => [:index]
  end

  resources :mappings
  
end
