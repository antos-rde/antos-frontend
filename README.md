
# AntOS v1.0.0-alpha

**This version 1.0.0a removes the dependencies on Riot.js by reimplementing the major API for GUI and Announcement system. The entire core API is also rewritten in TypeScript**

[![Build Status](https://travis-ci.org/lxsang/antos.svg?branch=master)](https://travis-ci.org/lxsang/antos)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flxsang%2Fantos.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Flxsang%2Fantos?ref=badge_shield)

AntOS is a front-end API that mimics the traditional desktop environment on the web browser. The front-end can connect to a remote server and acts as a virtual desktop environment (VDE). The original purpose of AntOS is to provide visual tools to access and control resource on remote server
and embedded linux environment. With its application API and the provided SDK, AntOS facilitates the
development and deployment of user specific applications.

![https://os.lxsang.me/VFS/shared/d4645d65b3e4bb348f1bde0d42598ad9b99367f5](https://os.lxsang.me/VFS/shared/d4645d65b3e4bb348f1bde0d42598ad9b99367f5)

Github: [https://github.com/lxsang/antos](https://github.com/lxsang/antos)

## Demo
A demo of the VDE is available at my page  [https://os.iohub.dev](https://os.iohub.dev) using username: demo and password: demo.

The demo use the **antosaio** docker image available at:
- [https://hub.docker.com/r/xsangle/antosaio](https://hub.docker.com/r/xsangle/antosaio)
- Instruction: [https://github.com/lxsang/antosaio](https://github.com/lxsang/antosaio)

## AntOS applications
[https://github.com/lxsang/antosdk-apps](https://github.com/lxsang/antosdk-apps)

## Documentation

- API Documentation: [https://doc.iohub.dev/antos/api/](https://doc.iohub.dev/antos/api/)
- Documentation : [https://doc.iohub.dev/antos](https://doc.iohub.dev/antos)

-----

## Change logs
It has been a long time since version 0.x.x and now AntOS hits a major changes in its API. From version 1.0.0, AntOS no longer depends on **Riot.js**  in its core UI API. This version introduces a brand new AntOS UI API called **AFX** API which is rewritten from bottom up. The entire AntOS core API is rewritten in Typescript (from Coffeescript)  for better debugging, code maintenance and documenting.

**Browser support**: tested on Chrome, Firefox and partly Safari. Any browser that supports custom elements API should work. May have problem with Microsoft Edge

* Say goodbye to Riot.js and welcome **Afx**, the brand new AntOS UI API
* Rewrite the entire core system in **Typescript** for better maintenance
* Core API now has Unit test using **jest**
* Introduce **AntOS dark** and **AntOS light** theme
* Default core applications are: **Files**, **CodePad**, **Setting**, **Syslog**, and **MarketPlace**
* More application can be install via **MarketPlace**
* **AntOSDK** is now integrated into **CodePad**
* Other applications are now developed with **CodePad** using **AntOSDK** and are hosted in a [separated repository](https://github.com/lxsang/antosdk-apps)
* System errors are reported in **Syslog**

## Credits

The core of AntOS is based on some open source libraries:
* Mandatory
    *  JQuery: [https://jquery.com/](https://jquery.com)
    
* Optional
    *  ACE editor library : [https://ace.c9.io/](https://ace.c9.io/)
    *  Font Awesome for default icon: [https://fontawesome.com](https://fontawesome.com)
    *  Showdown JS for markdown rendering: [https://github.com/showdownjs/showdown](https://github.com/showdownjs/showdown)
    *  Simple MDE for default Markdown editor: [https://simplemde.com/](https://simplemde.com/)
    *  JSZIP for in browser Zip file handle : [https://stuk.github.io/jszip/](https://stuk.github.io/jszip/)
    *  Other opensource libraries used by different application (see in each application README)..

## Licence

Copyright 2017-2021 Xuan Sang LE <xsang.le AT gmail DOT com>

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

