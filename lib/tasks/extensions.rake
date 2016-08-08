namespace :assets do
  task :js_compile do
    system "npm install"
    system "npm run build"
  end
end

Rake::Task[:'assets:precompile'].enhance([:'assets:js_compile'])
