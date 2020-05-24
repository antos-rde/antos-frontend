/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Copyright 2017-2018 Xuan Sang LE <xsang.le AT gmail DOT com>

// AnTOS Web desktop is is licensed under the GNU General Public
// License v3.0, see the LICENCE file for more information

// This program is free software: you can redistribute it and/or
// modify it under the terms of the GNU General Public License as
// published by the Free Software Foundation, either version 3 of 
// the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// General Public License for more details.

// You should have received a copy of the GNU General Public License
//along with this program. If not, see https://www.gnu.org/licenses/.
Ant.OS.API.HOST = Ant.location.hostname + (Ant.location.port ?`:${Ant.location.port}` : "");
Ant.OS.API.REST = `${Ant.location.protocol}//${Ant.OS.API.HOST}`;

Ant.OS.API.handle = {
    // get file, require authentification
    get: `${Ant.OS.API.REST}/VFS/get`,
    // get shared file with publish
    shared: `${Ant.OS.API.REST}/VFS/shared`,
    scandir(p) {
        const path = `${Ant.OS.API.REST}/VFS/scandir`;
        return Ant.OS.API.post(path, { path: p });
    },

    mkdir(p) {
        const path = `${Ant.OS.API.REST}/VFS/mkdir`;
        return Ant.OS.API.post(path, { path: p });
    },

    sharefile(p, pub) {
        const path = `${Ant.OS.API.REST}/VFS/publish`;
        return Ant.OS.API.post(path, { path: p , publish: pub });
    },

    fileinfo(p) {
        const path = `${Ant.OS.API.REST}/VFS/fileinfo`;
        return Ant.OS.API.post(path, { path: p });
    },

    readfile(p, t) {
        const path = `${Ant.OS.API.REST}/VFS/get/`;
        return Ant.OS.API.get(path + p, t);
    },

    move(s, d) {
        const path = `${Ant.OS.API.REST}/VFS/move`;
        return Ant.OS.API.post(path, { src: s, dest: d });
    },

    delete(p) {
        const path = `${Ant.OS.API.REST}/VFS/delete`;
        return Ant.OS.API.post(path, { path: p });
    },

    fileblob(p) {
        const path = `${Ant.OS.API.REST}/VFS/get/`;
        return Ant.OS.API.blob(path + p);
    },

    packages(d) {
        const path = `${Ant.OS.API.REST}/system/packages`;
        return Ant.OS.API.post(path, d);
    },

    upload(d) {
        const path = `${Ant.OS.API.REST}/VFS/upload`;
        return Ant.OS.API.upload(path, d);
    },

    write(p, d) {
        const path = `${Ant.OS.API.REST}/VFS/write`;
        return Ant.OS.API.post(path, { path: p, data: d });
    },

    scanapp(p, c ) {
        let path;
        return path = `${Ant.OS.API.REST}/system/application`;
    },
    
    apigateway(d, ws) {
        if (ws) {
            return new Promise(function(resolve, reject) {
                try {
                    const path = `${Ant.OS.API.HOST}/system/apigateway?ws=1`;
                    const proto = window.location.protocol === "https:" ? "wss://" : "ws://";
                    const socket = new WebSocket(proto + path);
                    return resolve(socket);
                } catch (e) {
                    return reject(__e(e));
                }
            });
        } else {
            const path = `${Ant.OS.API.REST}/system/apigateway?ws=0`;
            return Ant.OS.API.post(path, d);
        }
    },
    
    auth() {
        const p = `${Ant.OS.API.REST}/user/auth`;
        return Ant.OS.API.post(p, {});
    },

    login(d) {
        const p = `${Ant.OS.API.REST}/user/login`;
        return Ant.OS.API.post(p, d);
    },

    logout() {
        const p = `${Ant.OS.API.REST}/user/logout`;
        return Ant.OS.API.post(p, {});
    },

    setting() {
        const p = `${Ant.OS.API.REST}/system/settings`;
        return Ant.OS.API.post(p, Ant.OS.setting);
    },
    
    dbquery(cmd, d) {
        const path = `${Ant.OS.API.REST}/VDB/${cmd}`;
        return Ant.OS.API.post(path, d);
    }
};