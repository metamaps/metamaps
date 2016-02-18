Metamaps
=======

[![Join the chat at https://gitter.im/metamaps/metamaps_gen002](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/metamaps/metamaps_gen002?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://jenkins.devinhoward.ca/job/metamaps_gen002.develop/badge/icon)](https://jenkins.devinhoward.ca/job/metamaps_gen002.develop/)

Welcome to the Metamaps GitHub repo. 

## About

Metamaps is a free and AGPL open source technology for changemakers, innovators, educators and students. It enables individuals and communities to build and visualize their shared knowledge and unlock their collective intelligence. You can find out about more about the project at the [blog][site-blog].

You can find a version of this software running at [metamaps.cc][site-beta], where the technology is being tested in a private beta.

Metamaps is created and maintained by a distributed, nomadic community comprised of technologists, artists and storytellers. You can get in touch with us at team@metamaps.cc or @metamapps on twitter. 

To get connected with the community interested in Metamaps, join our [Google+ community][community].

## Installation

If you are on Mac or Ubuntu you can use the following instructions to quickly get a local copy of metamaps up and running using a Vagrant virtualbox. Don't be intimidated, it's easy!
```
git clone git@github.com:metamaps/metamaps_gen002.git
```
Now ensure you have VirtualBox and Vagrant installed on your computer
```
cd metamaps_gen002
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

We haven't figured out Vagrant for Windows yet, but we have a set of manual instructions here:

- [For Windows][windows-installation]

## Contributing

Cloning this repository directly is primarily for those wishing to contribute to our codebase. Check out our [contributing instructions][contributing] to get involved. 

## Community

- If you would like to report a bug, please check the [issues][contributing-issues] section in our [contributing instructions][contributing].
- To participate in discussions and a public forum about Metamaps, join the [Google+ community][community]
- For contributors, read more instructions in [CONTRIBUTING.md][contributing].

## Licensing information
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or(at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.

The license can be read [here][license].

Copyright (c) 2015 Connor Turland


[site-blog]: http://blog.metamaps.cc
[site-beta]: http://metamaps.cc
[community]: https://plus.google.com/u/0/communities/115060009262157699234
[license]: https://github.com/metamaps/metamaps_gen002/blob/develop/LICENSE
[contributing]: https://github.com/metamaps/metamaps_gen002/blob/develop/doc/CONTRIBUTING.md
[contributing-issues]: https://github.com/metamaps/metamaps_gen002/blob/develop/doc/CONTRIBUTING.md#reporting-bugs-and-other-issues
[windows-installation]: https://github.com/metamaps/metamaps_gen002/blob/develop/doc/WindowsInstallation.md
