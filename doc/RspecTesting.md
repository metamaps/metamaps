## Testing with RSpec

RSpec is a ruby gem that allows you to test your code base. This is great -
every time you make a change, you can do some basic sanity checks to make sure 
you didn't break anything.

To test Metamaps, run

    rspec

in the top level directory. It will automatically search the `spec` directory
for files called `*_spec.rb`, and run them as tests. When it's done testing, it
will print a report telling you how many tests failed. With luck, the number
will be 0.

Note that if your test database doesn't exist yet, you'll need to create it
first:

    RAILS_ENV=test rake db:create

At the time of writing, there are four directories in the spec folder. One,
`support`, is for helper functions. `rails_helper.rb` and `spec_helper.rb` are
also for helper functions.

`factories` is for a gem called [factory-girl][factory-girl]. This gem lets you
use the `create` and `build` functions to quickly create the simplest possible
valid version of a given model. For instance:

    let(:map1) { create :map }
    let(:ronald) { create :user, name: "Ronald" }
    let(:map2) { create :map, user: ronald }

As you can see, you can also customize the factories. You can read the full
documentation at the link above or check the existing specs to see how it works.
It is worth reading through the factories to see how they are defined. If you
add a model to `app/models`, please also create a factory for it that defines
the minimum valid state for that model.

Finally, `models` and `controllers` have the actual spec files. Writing specs is
usually fairly simple but you do need to understand the syntax. You can read
more at [rspec.info][rspec-docs].

If you modify the metamaps codebase, please consider adding tests verifying that
the added code works. This will help in a few ways:

 - Unrelated changes in the future that break your code will be spotted earlier
 - Your changes will be more easily understood, since the *purpose* will be
   described by the spec

Happy testing!

[factory-girl]: https://github.com/thoughtbot/factory_girl
[rspec-docs]: http://rspec.info
