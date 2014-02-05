ISSAD::Application.routes.draw do

  root to: 'main#home', via: :get
  
  match 'request', to: 'main#requestinvite', via: :get, as: :request
  match 'invite', to: 'main#invite', via: :get, as: :invite
  match 'faq', to: 'main#faq', via: :get, as: :faq
  
  match '/search/topics', to: 'main#searchtopics', via: :get, as: :searchtopics
  match '/search/maps', to: 'main#searchmaps', via: :get, as: :searchmaps
  match '/search/mappers', to: 'main#searchmappers', via: :get, as: :searchmappers
  match '/search/synapses', to: 'main#searchsynapses', via: :get, as: :searchsynapses
  
  match 'maps/:id/savelayout', to: 'maps#savelayout', via: :put, as: :savelayout
  match 'topics/:map_id/:topic_id/removefrommap', to: 'topics#removefrommap', via: :post, as: :removefrommap
  match 'synapses/:map_id/:synapse_id/removefrommap', to: 'synapses#removefrommap', via: :post, as: :removefrommap
  
  resources :topics, except: [:index, :new, :edit] do
    get :autocomplete_topic, :on => :collection
  end
  match 'topics/:id/:format', to: 'topics#json', via: :get, as: :json
  
  resources :synapses, except: [:index, :new, :edit, :show]
  match 'synapses/:id/:format', to: 'synapses#json', via: :get, as: :json
  
  resources :maps, except: [:new, :edit]
  match 'maps/:id/embed', to: 'maps#embed', via: :get, as: :embed
  match 'maps/:id/:format', to: 'maps#json', via: :get, as: :json
  
  devise_for :users, :path_names => { :sign_in => 'login', :sign_out => 'logout' }
  devise_scope :user do
    get "sign_out", :to => "devise/sessions#destroy"
  end
  
  resources :users, except: :show

  resources :mappings
  
end
