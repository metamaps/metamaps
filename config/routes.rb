ISSAD::Application.routes.draw do

  root to: 'main#home', via: :get
  
  match 'console', to: 'main#console', via: :get, as: :console
  
  match 'request', to: 'main#requestinvite', via: :get, as: :request
  
  match 'invite', to: 'main#invite', via: :get, as: :invite
  
  match 'search', to: 'main#search', via: :get, as: :search
  
  match 'maps/:id/savelayout', to: 'maps#savelayout', via: :put, as: :savelayout
  match 'maps/:id/realtime', to: 'maps#realtime', via: :get, as: :realtime
  match 'topics/:map_id/:topic_id/removefrommap', to: 'topics#removefrommap', via: :post, as: :removefrommap
  match 'synapses/:map_id/:synapse_id/removefrommap', to: 'synapses#removefrommap', via: :post, as: :removefrommap

  resource :session
  
  resources :topics do
    get :autocomplete_topic_name, :on => :collection
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
  
  resources :users do
    get :autocomplete_user_name, :on => :collection
	  resources :topics, :only => [:index]
    resources :synapses, :only => [:index]
	  resources :maps, :only => [:index]
  end

  resources :mappings
  
  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'
end
