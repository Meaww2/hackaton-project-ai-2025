Rails.application.routes.draw do
  devise_for :users,
             defaults: { format: :json },
             path: 'api/v1',
             path_names: {
               sign_in: 'login',
               sign_out: 'logout',
               sign_up: 'register'
             },
             controllers: {
               sessions: 'users/sessions',
               registrations: 'users/registrations'
             }
  namespace :api do
    namespace :v1 do
      get 'dashboard/stock', to: 'dashboard#stock'
      post 'products/reorder_suggestion', to: 'products#reorder_suggestion'
      resources :products, only: %i[index create update]
      resources :stock_movements, only: %i[index create]
    end
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
end
