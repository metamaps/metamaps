# frozen_string_literal: true

Rails.application.configure do
  # Version of your assets, change this if you want to expire all your assets.
  config.assets.version = '2.0'
  config.assets.quiet = true

  # Add additional assets to the asset load path
  # Rails.application.config.assets.paths << Emoji.images_path

  # Precompile additional assets.
  # application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
  config.assets.precompile += %w[application-secret.css application-secret.js webpacked/metamaps.bundle.js]
end
