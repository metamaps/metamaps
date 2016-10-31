# frozen_string_literal: true
namespace :assets do
  task :js_compile do
    system 'npm install'
    system 'npm run build'
    system 'bin/build-apidocs.sh' if Rails.env.production?
  end
end

Rake::Task[:'assets:precompile'].enhance([:'assets:js_compile'])
