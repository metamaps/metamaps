Metamaps::Application.routes.draw do

  root to: 'main#home', via: :get
    
  devise_scope :user do 
    get "join" => "devise/registrations#new" 
  end
  
  match 'request', to: 'main#requestinvite', via: :get, as: :request
  
  match 'search/topics', to: 'main#searchtopics', via: :get, as: :searchtopics
  match 'search/maps', to: 'main#searchmaps', via: :get, as: :searchmaps
  match 'search/mappers', to: 'main#searchmappers', via: :get, as: :searchmappers
  match 'search/synapses', to: 'main#searchsynapses', via: :get, as: :searchsynapses
  
  resources :mappings, except: [:index, :new, :edit]
  resources :metacode_sets, :except => [:show]
  resources :metacodes, :except => [:show, :destroy]
  resources :synapses, except: [:index, :new, :edit]
  resources :topics, except: [:index, :new, :edit] do
    get :autocomplete_topic, :on => :collection
  end
  match 'topics/:id/network', to: 'topics#network', via: :get, as: :network
  
  match 'explore/active', to: 'maps#index', via: :get, as: :activemaps
  match 'explore/featured', to: 'maps#index', via: :get, as: :featuredmaps
  match 'explore/mine', to: 'maps#index', via: :get, as: :mymaps
  match 'maps/mappers/:id', to: 'maps#index', via: :get, as: :usermaps
  match 'maps/topics/:id', to: 'maps#index', via: :get, as: :topicmaps
  resources :maps, except: [:new, :edit]
  match 'maps/:id/embed', to: 'maps#embed', via: :get, as: :embed
  match 'maps/:id/contains', to: 'maps#contains', via: :get, as: :contains
  
  devise_for :users, :controllers => { :registrations => "registrations" }, :path_names => { :sign_in => 'login', :sign_out => 'logout' }
  devise_scope :user do
    get "sign_out", :to => "devise/sessions#destroy"
  end
  match 'user/updatemetacodes', to: 'users#updatemetacodes', via: :post, as: :updatemetacodes
  resources :users, except: [:index, :destroy]
end
