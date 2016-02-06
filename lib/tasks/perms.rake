require 'dotenv/tasks'

namespace :perms do
  desc "Update the Unix permissions on the public directory"
  task :fix => :environment do
    # e.g. rake perms:fix user=mmstaging group=mmstaging
    # e.g. rake perms:fix group=www-data #probably don't need this one
    # e.g. rake perms:fix
    user = ENV['user'] || 'metamaps'
    group = ENV['group'] || 'metamaps'
    public_dir = Rails.root.join('public').to_s
    system "chown -R #{user}:#{group} #{public_dir}"
    system "find #{public_dir} -type d -exec chmod 755 '{}' \\;"
    system "find #{public_dir} -type f -exec chmod 644 '{}' \\;"
  end
end
