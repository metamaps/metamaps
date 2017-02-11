# frozen_string_literal: true
Metamaps::Application.routes.draw do
  use_doorkeeper
  mount ActionCable.server => '/cable'

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
  get :explore, to: redirect('/')

  resources :maps, except: [:index, :edit] do
    member do
      get :conversation
      get :export
      post 'events/:event', action: :events
      get :contains

      get :request_access,
          to: 'access#request_access'
      get 'approve_access/:request_id',
          to: 'access#approve_access',
          as: :approve_access
      get 'deny_access/:request_id',
          to: 'access#deny_access',
          as: :deny_access

      post :access_request,
           to: 'access#access_request',
           default: { format: :json }
      post 'approve_access/:request_id',
           to: 'access#approve_access_post',
           as: :approve_access_post,
           default: { format: :json }
      post 'deny_access/:request_id',
           to: 'access#deny_access_post',
           as: :deny_access_post,
           default: { format: :json }

      post :access, to: 'access#access', default: { format: :json }

      post :star, to: 'stars#create', default: { format: :json }
      post :unstar, to: 'stars#destroy', default: { format: :json }
    end
  end

  resources :mappings, except: [:index, :new, :edit]

  resources :messages, only: [:show, :create, :update, :destroy]
  resources :notifications, only: [:index, :show] do
    collection do
      get :unsubscribe
    end
    member do
      put :mark_read
      put :mark_unread
    end
  end

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

  devise_for :users, skip: :sessions, controllers: {
    registrations: 'users/registrations',
    passwords: 'users/passwords',
    sessions: 'users/sessions'
  }

  devise_scope :user do
    get 'login' => 'users/sessions#new', :as => :sign_in
    post 'login' => 'users/sessions#create', :as => :user_session
    get 'logout' => 'users/sessions#destroy', :as => :destroy_user_session
    get 'join' => 'users/registrations#new', :as => :sign_up
  end

  resources :users, except: [:index, :destroy] do
    member do
      get :details
    end
  end
  post 'user/updatemetacodes', to: 'users#updatemetacodes', as: :updatemetacodes
  post 'user/update_metacode_focus', to: 'users#update_metacode_focus'

  namespace :api, path: '/api', default: { format: :json } do
    namespace :v2, path: '/v2' do
      resources :metacodes, only: [:index, :show]
      resources :mappings, only: [:index, :create, :show, :update, :destroy]
      resources :maps, only: [:index, :create, :show, :update, :destroy] do
        post :stars, to: 'stars#create', on: :member
        delete :stars, to: 'stars#destroy', on: :member
      end
      resources :synapses, only: [:index, :create, :show, :update, :destroy]
      resources :tokens, only: [:index, :create, :destroy]
      resources :topics, only: [:index, :create, :show, :update, :destroy]
      resources :users, only: [:index, :show] do
        get :current, on: :collection
      end
      match '*path', to: 'restful#catch_404', via: :all
    end
    namespace :v1, path: '/v1' do
      root to: 'deprecated#deprecated', via: :all
      match '*path', to: 'deprecated#deprecated', via: :all
    end
    match '*path', to: 'v2/restful#catch_404', via: :all
  end

  namespace :hacks do
    get 'load_url_title'
  end
end
# rubocop:enable Rubocop/Metrics/BlockLength
