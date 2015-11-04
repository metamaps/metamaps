# Contributing to Metamaps

Active involvement from the community is essential to help make Metamaps as beneficial for communities as it can be. You can help by reporting bugs, fixing bugs, adding features, contributing new modules and by providing feedback.


## Reporting bugs and other issues

If you think you've encountered a bug, do the following:

1. Make sure you are working with the latest version of the Metamaps `master` branch.
2. Browse through the [issues][metamaps-issues] to check if
   anyone else has already reported. If someone has, feel free to add more
   information to that issue to help us solve it.
3. If no one has yet submitted the issue you are encountering, add it in! Please be sure
   to include as much information as possible, include errors, warnings,
   screenshots, links to a video showing the problem or code that can reproduce
   the issue.


## Contributing code

Metamaps is made possible by open source
contributors like you. We're very interested in getting help from the greater
community, but before you start it's important that you become acquainted with
our workflow. Following these guidelines below will make collaboration much
smoother and increase the chances that we will accept your pull request without
hiccups.


### Development Process

Our development process is very similar to the approach
described in the well-known article [A Successful Git Branching Model by Vincent
Driessen][git-branching-model]. Here's an overview:

* Our `master` branch is the branch upon which 
  Metamaps developers should be basing their work on. The `master` branch is not guaranteed to be stable.
* All commits intended for `master` should take place on your own personal
  fork, and be submitted via pull request when ready.
* Only maintainers can accept pull requests from forks into the core Metamaps.cc
  repository.
* Please squash your commits into a single commit before making a pull request.

### Getting started

1. Make sure you have a [GitHub account](https://github.com/signup/free)
2. [Fork metamaps][fork-metamaps]
3. Keep your fork up to date. Metamaps is a fast moving project, and things are
   changing all the time. It's important that any changes you make are based on
   the most recent version of metamaps, since it's possible that something may
   have changed that breaks your pull request or invalidates its need.
4. Make sure you have a [Contributor License Agreement](http://caa.metamaps.cc) on file.
5. Read on ...


### Contributor License Agreement

Before we can accept any contributions to Metamaps, we first require that all
individuals or companies agree to our Contributor License Agreement (CLA). The e-mail
address used in the pull request will be used to check if a CLA has already been
filed, so be sure to list all email addresses that you might use to submit your
pull requests when filling it out. Our CLA can be found [here](http://caa.metamaps.cc).

### Testing and Linting

TODO


### Branch grouping tokens

All pull requests submitted to Metamaps.cc should occur on a new branch. For these
branches, we at metamaps use a short token indicating the nature of the branch in
question followed by a solidus (`/`) and a kebab-cased string describing the
branch. We are using the following tokens:
**NOTE: Not sure the above is right, but also not sure what to change it to **

    bug   // bug fixes
    wip   // work in progress
    feat  // feature

Bug fixes follow a [slightly different format](#bug-fixes).

### Bug fixes

If you'd like to contribute a fix for a bug you've encountered, first read up on
[how to report a bug](#reporting-bugs-and-other-issues) and report it so we are
aware of the issue. By filing the issue first, we may be able to provide you
with some insight that guides you in the right direction.

[metamaps-issues]: https://github.com/metamaps/metamaps_gen002/issues
[git-branching-model]: http://nvie.com/posts/a-successful-git-branching-model/
[fork-metamaps]: https://github.com/metamaps/metamaps_gen002/fork
[cla]: http://metamaps.cc/cla
