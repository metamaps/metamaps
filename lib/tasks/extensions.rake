# frozen_string_literal: true
namespace :assets do
  task :js_compile do
    system 'npm install'
    system 'npm run build'
  end

  task :production_ready do
    system 'bin/build-apidocs.sh' if Rails.env.production?
    Rake::Task['perms:fix'].invoke if Rails.env.production?
  end
end

Rake::Task[:'assets:precompile'].enhance([:'assets:js_compile'])
Rake::Task[:'assets:precompile'].enhance([:'assets:production_ready'])
