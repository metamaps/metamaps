require 'sidekiq/web'

Metamaps::Application.routes.draw do

  root to: 'main#home', via: :get

  #To debug sidekiq and monitor processes, enable this route
  #mount Sidekiq::Web, at: '/sidekiq'
  
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
  match 'maps/:id/contains', to: 'maps#contains', via: :get, as: :contains
  
  devise_for :users, controllers: { registrations: 'users/registrations', passwords: 'users/passwords', sessions: 'devise/sessions' }, :skip => [:sessions]

  devise_scope :user do 
    get 'login' => 'devise/sessions#new', :as => :new_user_session
    post 'login' => 'devise/sessions#create', :as => :user_session
    get 'logout' => 'devise/sessions#destroy', :as => :destroy_user_session
    get 'join' => 'devise/registrations#new', :as => :new_user_registration
  end

  match 'user/updatemetacodes', to: 'users#updatemetacodes', via: :post, as: :updatemetacodes
  resources :users, except: [:index, :destroy]
end
