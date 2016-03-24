# Contributing to Metamaps

Active involvement from the community is essential to help make Metamaps as
beneficial for communities as it can be. You can help by reporting bugs, fixing
bugs, adding features, contributing new modules and by providing feedback.

## Reporting bugs and other issues

If you think you've encountered a bug, do the following:

1. Make sure you are working with the latest version of the Metamaps `develop`
   branch.
2. Browse through the [issues][metamaps-issues] to check if anyone else has
   already reported. If someone has, feel free to add more information to that
   issue to help us solve it.
3. If no one has yet submitted the issue you are encountering, add it in! Please
   be sure to include as much information as possible, include errors, warnings,
   screenshots, links to a video showing the problem or code that can reproduce
   the issue.

## Contributing code

Metamaps is made possible by open source contributors like you. We're very
interested in getting help from the greater community, but before you start it's
important that you become acquainted with our workflow. Following these
guidelines below will make collaboration much smoother and increase the chances
that we will accept your pull request without hiccups.

### Development Process

Our development process is very similar to the approach described in the
well-known article [A Successful Git Branching Model by Vincent Driessen
][git-branching-model]. Here's an overview:

* The `master` branch is the current base for our deployed instances. This
  branch *must* remain stable and always work.
* The `develop` branch is the current state of development. Metamaps
  developers base their work on this branch. It is not guaranteed to be
  stable.
* All code must be reviewed before being committed to develop or master. This
  means all commits should take place on your own personal branch, and
  submitted via a Github pull request when ready.
* Only maintainers can accept pull requests from forks into the core
  Metamaps.cc repository.

### Getting started

1. Make sure you have a [GitHub account](https://github.com/signup/free)
2. [Fork metamaps][fork-metamaps]
3. Keep your fork up to date. Metamaps is a fast moving project, and things
   are changing all the time. It's important that any changes you make are
   based on the most recent version of metamaps, since it's possible that
   something may have changed that breaks your pull request or invalidates it.
4. Make sure you have a [Contributor License Agreement](http://caa.metamaps.cc
   ) on file.
5. Read on ...


### Contributor License Agreement

Before we can accept any contributions to Metamaps, we first require that all
individuals or companies agree to our Contributor License Agreement (CLA). The
e-mail address used in the pull request will be used to check if a CLA has
already been filed, so be sure to list all email addresses that you might use to
submit your pull requests when filling it out. [Our CLA can be found here](
http://caa.metamaps.cc).

### Testing and Linting

Please run `rspec` in the Metamaps root directory before submitting your pull
request.

### Branch grouping tokens

All pull requests submitted to Metamaps.cc should occur on a new branch. For
these branches, please use a short token indicating the nature of the branch in
question followed by a `/` and then a very concise string describing the branch.
This isn't a very important part of the workflow, but we are currently using the
following branch prefixes:

    fix      // bug fixes
    wip      // work in progress (not suitable for a pull request)
    instance // (internal) Tracks customizations made to metamaps instances
    feature  // All other new features

### Bug fixes

If you'd like to contribute a fix for a bug you've encountered, first read up on
[how to report a bug](#reporting-bugs-and-other-issues) and report it so we are
aware of the issue. By filing the issue first, we may be able to provide you
with some insight that guides you in the right direction.

[metamaps-issues]: https://github.com/metamaps/metamaps_gen002/labels/bug
[git-branching-model]: http://nvie.com/posts/a-successful-git-branching-model/
[fork-metamaps]: https://github.com/metamaps/metamaps_gen002/fork
[cla]: http://metamaps.cc/cla
