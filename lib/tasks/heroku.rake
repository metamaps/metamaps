require 'dotenv/tasks'

namespace :heroku do
  desc 'Generate the Heroku gems manifest from gem dependencies'
  task gems: :dotenv do
    RAILS_ENV = 'production'.freeze
    Rake::Task[:environment].invoke
    list = Rails.configuration.gems.collect do |g|
      _command, *options = g.send(:install_command)
      options.join(' ') + "\n"
    end

    File.open(File.join(RAILS_ROOT, '.gems'), 'w') do |f|
      f.write(list)
    end
  end
end
