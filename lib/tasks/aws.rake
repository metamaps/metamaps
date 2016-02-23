namespace :aws do
  desc 'migrate metacodes to aws'
  task metacode_icon_migrate: :environment do
    def no_aws(msg)
      Rails.logger.error msg
    end
    
    no_aws 'You need to configure S3_BUCKET' unless ENV['S3_BUCKET'].present?
    no_aws 'You need to configure AWS_ACCESS_KEY_ID' unless ENV['AWS_ACCESS_KEY_ID'].present?
    no_aws 'You need to configure AWS_SECRET_ACCESS_KEY' unless ENV['AWS_SECRET_ACCESS_KEY'].present?

    Metacode.find_each do |metacode|
      metacode.icon = metacode.old_icon
      metacode.save
    end
  end
end
