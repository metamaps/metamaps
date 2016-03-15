# How does Ruby on Rails work?

Ruby on Rails is a pretty intimidating framework to get started with, since there are so many files. Here's a quick rundown on getting started:

1. Where should I look for code?
2. How do I know what code generates what pages of metamaps.cc?

## Where should I look for code?

Here are the top level folders you should know about:

- app: holds the ruby code + assets that make up the app. Really, you only need to look in here to see how the app works.
- spec: tests describing how the code *should* work
- db: code for handling interaction with the underlying Postgresql database
- config: low-level, in-depth configuration variables.
- Gemfile: listing of app dependencies from https://rubygems.org/
- realtime: code for our Node.JS realtime server. This is a separate server written in Javascript that isn't served by ruby on rails.

Within the app/ folder, you can find these important folders:

- models: files describing the logic surrounding maps, topics, synapses and more in the framework
- views: HTML template files that allow you to generate HTML using ruby code
- helpers: globally accessible helper functions available to views; they help us take logic out of the view files
- controllers: functions that map a route (e.g. `GET https://metamaps.cc/maps/2`) to a controller action (e.g. maps_controller.rb's `show` function).
- services: files that encapsulate a certain feature or logic into one file that can be referenced. Usually services help us take logic out of models and controllers.
- assets/stylesheets: CSS stylesheets for look and feel
- assets/javascripts: This is a huge folder, containing all of our Javascript code. This folder itself is at least as important as the rest of the repository.
    
## How do I know what code generates what pages of metamaps.cc?

The lifecycle works something like this.

1. run `rake routes` inside the metamaps_gen002 directory on your computer, and it will generate a list  with entries looking something like `GET /maps/:id maps#show`. This tells you which URL will end up at which *controller*. In this example, if you accessed `https://metamaps.cc/maps/2`, you are looking for the maps_controller's `show` function, and there will be a variable params["id"] that is equal to 2.
2. Now in `app/controllers/maps_controller.rb`, you can find the function. It should do some calculations, create an instance variable @map, and then do one of two things:
  - If it doesn't call anything, ruby on rails will automatically load app/views/map/show.html.erb. (NB: If you loaded `/maps/2.json`, it would look for app/views/map/show.json.erb). Any instance variables assigned (e.g. @map) will be available to the view file (show.html.erb).
  - You can also call the render function directly. See the codebase or http://guides.rubyonrails.org/layouts_and_rendering.html#using-render for details.
3. The map's show template (show.html.erb) will contain actual HTML, which gets us a lot closer to an HTML page. Ruby on rails will fill in a "layout" from app/views/layouts to wrap the content of the page. It will also let you include code with `<% %>` (for logical operations) or `<%= %>` (to print a ruby string directly to the HTML page). The view may refer to attributes on the @map object passed from the controller. For more details on how the @map object works, you can check its definition in app/models/map.rb.
4. The shortest possible rails model file would look like this: `class Map < ActiveRecord::Base; end`. In this case, rails would look for a database table called "maps" and allow access to the columns. For instance, a postgresql INTEGER column called "id" would be accessible as @map.id. However, you can also specify validations, shorthand queries called scopes, and helper functions that specify the logic of the model. It is generally preferable to put logic in the model rather than in a controller or view, so these files are excellent sources of information about how the app works.
