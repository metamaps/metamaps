# frozen_string_literal: true
namespace :assets do
  task :js_compile do
    system 'npm install'
    system 'npm run build'
    system 'bin/build-apidocs.sh' if ENV['MAILER_DEFAULT_URL'] == 'metamaps.herokuapp.com'
  end
end

Rake::Task[:'assets:precompile'].enhance([:'assets:js_compile'])
