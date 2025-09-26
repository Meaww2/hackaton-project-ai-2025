Rails.application.routes.draw do
  namespace :api do
    namespace :authentication do
      post   "sign_in",  to: "sessions#sign_in"
      delete "sign_out", to: "sessions#sign_out"
      get    "current",  to: "sessions#current"
    end

    namespace :v1 do
      resources :products
      resources :orders
    end
  end
end
