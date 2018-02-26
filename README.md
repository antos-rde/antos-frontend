# antOS
Server or Embedded Linux are often headless, so accessing the resource on these systems is not always obvious. The aim of this project is to develop a client core API that provides a desktop like experience  to remotely access resource on the server  using web technologies. AntOS is based on jQuery and Riot, it is designed to be used along with our antd server and Lua based server side app, but can be adapted to be used with any server side languages (PHP, etc) and server, by implementing all the system calls API defined in core/handlers/RemoteHandler.coffee. Basically, application design for the web os relies on these system calls for communicating with the server.  The API defines the core UI, system calls (to server), Virtual File system, virtual database and the necessary libraries for easing the development of webOS's applications. Applications can be developped with coffee/javascript/css without the need of a server side script.

Note that, the development of the project is in early alpha state, so bugs are very welcome :)

## Demo
A demo of the webOS is available at my page  [https://os.lxsang.me](https://os.lxsang.me) using username: demo and password: demo

![Screenshot](screenshot.png "Screenshot")
 

