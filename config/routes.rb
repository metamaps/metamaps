# frozen_string_literal: true
Metamaps::Application.routes.draw do
  use_doorkeeper

  root to: 'main#home', via: :get
  get 'request', to: 'main#requestinvite', as: :request

  namespace :explore do
    get 'active'
    get 'featured'
    get 'mine'
    get 'shared'
    get 'starred'
    get 'mapper/:id', action: 'mapper'
  end

  resources :maps, except: [:index, :edit] do
    member do
      get :export
      post 'events/:event', action: :events
      get :contains
      post :access, default: { format: :json }
      post :star, to: 'stars#create', defaults: { format: :json }
      post :unstar, to: 'stars#destroy', defaults: { format: :json }
    end
  end

  resources :mappings, except: [:index, :new, :edit]

  resources :messages, only: [:show, :create, :update, :destroy]

  resources :metacode_sets, except: [:show]

  resources :metacodes, except: [:destroy]
  get 'metacodes/:name', to: 'metacodes#show'

  namespace :search do
    get :topics
    get :maps
    get :mappers
    get :synapses
  end

  resources :synapses, except: [:index, :new, :edit]

  resources :topics, except: [:index, :new, :edit] do
    member do
      get :network
      get :relative_numbers
      get :relatives
    end
    collection do
      get :autocomplete_topic
    end
  end

  resources :users, except: [:index, :destroy] do
    member do
      get :details
    end
  end
  post 'user/updatemetacodes', to: 'users#updatemetacodes', as: :updatemetacodes

  namespace :api, path: '/api', default: { format: :json } do
    namespace :v2, path: '/v2' do
      resources :maps, only: [:index, :create, :show, :update, :destroy]
      resources :synapses, only: [:index, :create, :show, :update, :destroy]
      resources :topics, only: [:index, :create, :show, :update, :destroy]
      resources :mappings, only: [:index, :create, :show, :update, :destroy]
      resources :tokens, only: [:create, :destroy] do
        get :my_tokens, on: :collection
      end
    end
    namespace :v1, path: '/v1' do
      # api v1 routes all lead to a deprecation error method
      # see app/controllers/api/v1/deprecated_controller.rb
      resources :maps, only: [:create, :show, :update, :destroy]
      resources :synapses, only: [:create, :show, :update, :destroy]
      resources :topics, only: [:create, :show, :update, :destroy]
      resources :mappings, only: [:create, :show, :update, :destroy]
      resources :tokens, only: [:create, :destroy] do
        get :my_tokens, on: :collection
      end
    end
  end

  devise_for :users, skip: :sessions, controllers: {
    registrations: 'users/registrations',
    passwords: 'users/passwords',
    sessions: 'devise/sessions'
  }

  devise_scope :user do
    get 'login' => 'devise/sessions#new', :as => :new_user_session
    post 'login' => 'devise/sessions#create', :as => :user_session
    get 'logout' => 'devise/sessions#destroy', :as => :destroy_user_session
    get 'join' => 'devise/registrations#new', :as => :new_user_registration_path
  end

  namespace :hacks do
    get 'load_url_title'
  end
end
