ENV['RAILS_ENV'] ||= 'test'

require_relative 'dummy/config/environment'

require 'rspec/rails'

Time.zone = 'London'

Dir[Rails.root.join('./../support/**/*.rb')].each { |f| require f  }
Dir[Rails.root.join('./../factories/**/*.rb')].each { |f| require f  }

RSpec.configure do |config|
  config.include Rails.application.routes.url_helpers
  config.infer_base_class_for_anonymous_controllers = false
end
