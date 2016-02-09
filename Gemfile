source 'https://rubygems.org'
ruby '2.1.3'

gem 'rails', '4.2.4'

gem 'devise'
gem 'redis'
gem 'pg'
gem 'cancancan'
gem 'formula'
gem 'formtastic'
gem 'json'
gem 'rails3-jquery-autocomplete'
gem 'best_in_place' #in-place editing
gem 'kaminari' # pagination
gem 'uservoice-ruby'
gem 'dotenv'

gem 'paperclip'
gem 'aws-sdk', '< 2.0'

gem 'jquery-rails'
gem 'jquery-ui-rails'
gem 'jbuilder'

#gem 'therubyracer' #optional
#gem 'rb-readline'

# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails'
  gem 'coffee-rails'

  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  # gem 'therubyracer'

  gem 'uglifier'
end

group :test do
  gem 'rspec-rails'
  gem 'factory_girl_rails'
  gem 'shoulda-matchers'
  gem 'simplecov', require: false
  gem 'json-schema'
end

group :production do #this is used on heroku
 #gem 'rmagick'
 gem 'rails_12factor'
end

group :development, :test do
  gem 'pry-rails'
  gem 'pry-byebug'
  gem 'better_errors'
  gem 'binding_of_caller'
  gem 'quiet_assets'
  gem 'tunemygc'
end
