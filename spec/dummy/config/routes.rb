Dummy::Application.routes.draw do
  root to: "home#index"

  resources :components, only: [] do
    collection do
      get 'common'
    end
  end

  resources :forms, only: [:index]
  resources :typography, only: [:index]
  resources :html, only: [:index]
  resources :css, only: [:index]
  resources :javascript, only: [:index]

  get "/integrated_dough_helper", to: "integrated_dough_helper#index"
end

Rails.application.routes.draw do
  mount Dough::Engine => "/dough"
end
