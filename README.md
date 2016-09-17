Metamaps
=======

[![Build Status](https://travis-ci.org/metamaps/metamaps.svg?branch=develop)](https://travis-ci.org/metamaps/metamaps)

## What is Metamaps?

Metamaps is a free and open source technology for changemakers, innovators, educators and students. It enables individuals and communities to build and visualize their shared knowledge and unlock their collective intelligence.

You can find a version of this software running at [metamaps.cc][site-beta], where the technology is being tested in a private beta.

Metamaps is created and maintained by a distributed, nomadic community comprised of technologists, artists and storytellers. You can get in touch by using whichever of these channels you prefer:

## Community

- To send us a personal message or request an invite to the open beta, get in touch with us at team@metamaps.cc or @metamapps on Twitter.
- If you would like to report a bug, please check the [issues][contributing-issues] section in our [contributing instructions][contributing].
- If you would like to get set up as a developer, that's great! Read on for help getting your development environment set up.

## Installation

If you are on Mac or Ubuntu you can use the following instructions to quickly get a local copy of metamaps up and running using a Vagrant virtualbox. Don't be intimidated, it's easy!
```
git clone git@github.com:metamaps/metamaps.git
```
Now ensure you have VirtualBox and Vagrant installed on your computer
```
cd metamaps
./bin/configure.sh
```
This will do all the setup steps to make Metamaps work with a bit of behind the scenes ninja magick.

To start servers which will run metamaps you can then run:
```
./bin/start
```
To stop them:
```
./bin/stop
```
With your webservers running, open a web browser and go to `http://localhost:3000`

You can sign in with the default account
email: `user@user.com`
password: `toolsplusconsciousness`
OR create a new account at `/join`, and use access code `qwertyui`

Start mapping and programming!

We haven't set up instructions for using Vagrant on Windows, but there are instructions for a manual setup here:

- [For Windows][windows-installation]

## Contributing guidelines

Cloning this repository directly is primarily for those wishing to contribute to our codebase. Check out our [contributing instructions][contributing] to get involved.

## Licensing information

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or(at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.

The license can be read [here][license].

Copyright (c) 2015 Connor Turland

[site-blog]: http://blog.metamaps.cc
[site-beta]: http://metamaps.cc
[license]: https://github.com/metamaps/metamaps/blob/develop/LICENSE
[contributing]: https://github.com/metamaps/metamaps/blob/develop/doc/CONTRIBUTING.md
[contributing-issues]: https://github.com/metamaps/metamaps/blob/develop/doc/CONTRIBUTING.md#reporting-bugs-and-other-issues
[windows-installation]: https://github.com/metamaps/metamaps/blob/develop/doc/WindowsInstallation.md
