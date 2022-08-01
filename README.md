# antOS v1.2.1

[![Build Status](https://travis-ci.org/lxsang/antos.svg?branch=master)](https://travis-ci.org/lxsang/antos)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flxsang%2Fantos.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Flxsang%2Fantos?ref=badge_shield)

AntOS is a front-end system and API that implement the traditional desktop UI environment on the web browser. The front-end can connect to a remote server and acts as a virtual desktop environment (VDE). The original purpose of AntOS is to offer: (1) visual tools to access and control resource on remote server
and embedded linux environment; (2) front-end API for SaaS web-based applications. With its application API and the provided SDK, AntOS facilitates the
development and deployment of user specific applications inside de VDE environment.

![https://os.lxsang.me/VFS/shared/d4645d65b3e4bb348f1bde0d42598ad9b99367f5](https://os.lxsang.me/VFS/shared/d4645d65b3e4bb348f1bde0d42598ad9b99367f5)

Github: [https://github.com/lxsang/antos](https://github.com/lxsang/antos)

## Change logs
* V.1.2.1 WIP with Jenkinsfile support and webhook
* V.1.2.0 Improvement GUI API
   - [x] File dialog should remember last opened folder
   - [x] Add dynamic key-value dialog that work on any object
   - [x] Window list panel should show window title in tooltip when mouse hovering on application icon
   - [x] Allow pinning application to system panel
   - [x] Improvement application list in market place
   - [x] Allow triplet keyboard shortcut in GUI
   - [x] CodePad allows setting shortcut in CommandPalette commands
   - [ ] Improvement multi-window application support
   - [x] CodePad should have recent menu entry that remember top n file opened
   - [x] Improve File application grid view
   - [x] Label text should be selectable 
   - [x] switch window using shortcut
   - [x] Loading bar animation on system pannel
   - [x] Multiple file upload support
   - [x] Generic key-value dialog 
   - [x] Add bootstrap font support for icons
   - [x] Class applications by categories in start menu
   - [x]  Support vertical and horizontal resize window
* Market place now classifies application by categories
* CodePad is no longer default system application, it has been moved to MarketPlace
* More applications added to MarketPlace
* Antos SDK
   - SDK is no longer included in base Antos release, it can be installed via MarketPlace
   - The SDK now has a generic API that can be used in different development tasks other than AntOS application
   - Heavy SDK tasks are now offloaded to workers
   - Introduce new JSON based syntax for SDK task/target definition
* From this version, docker image of All-in-one AntOS system is available at: [https://hub.docker.com/r/xsangle/antosaio](https://hub.docker.com/r/xsangle/antosaio)

## Demo
A demo of the VDE is available at  [https://app.iohub.dev/antos/](https://app.iohub.dev/antos/) using username: demo and password: demo.

If one want to run AntOS VDE locally in their system, a docker image is available at:
[https://github.com/lxsang/antosaio](https://github.com/lxsang/antosaio)

## AntOS applications (Available on the MarketPlace)
[https://github.com/lxsang/antosdk-apps](https://github.com/lxsang/antosdk-apps)

## Documentation

- Documentation: [https://doc.iohub.dev/antos](https://doc.iohub.dev/antos)
- API: (https://doc.iohub.dev/antos/api/)[https://doc.iohub.dev/antos/api/]

## Licence

Copyright 2017-2021 Xuan Sang LE <mrsang AT iohub DOT dev>

AnTOS is is licensed under the GNU General Public License v3.0, see the LICENCE file for more information

 This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

   This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

**For comercial use, please contact author**
