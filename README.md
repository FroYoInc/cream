# Waffle Cone API
[![Build Status](https://travis-ci.org/FroYoInc/wafflecone.svg?branch=develop)](https://travis-ci.org/FroYoInc/wafflecone)

The backend API

# How to develop
1. Make sure you have `node` and `npm` and [`rethinkdb`](http://rethinkdb.com) installed
2. Run `rethinkdb` on any port other than 8080

   ```sh
   $ rethinkdb --http-port 9090
   ```
3. Install `gulp` globally

   ```sh
   $ npm install gulp -g
   ```
4. Run `npm install` inside `wafflecone/`
5. Run `gulp` inside `wafflecone/`
6. Go to [http://localhost:8080/docs/](http://localhost:8080/docs/)

# How to run rethinkDB on Windows
`Vagrant` will be used to create an Ubuntu virtual machine. RethinkDB will be installed on this virtual machine. Ports will be forwarded so that it looks like rethinkDB is installed on your local machine. You can access rethinkDB web UI on `localhost:9090`. `gulp integrate` should work out of the box. 

1. Make sure you have [`VirtualBox`](https://www.virtualbox.org/wiki/Downloads) and [`Vagrant`](https://www.vagrantup.com/downloads.html) installed
2. Run `vagrant up` inside `wafflecone/vagrant/`. (Note: the first time you run `vagrant up` it will take some time to download the ubuntu image. After that subsequent `vagrant` commands should be fast)
3. Optional: to stop the virtual machine run `vagrant halt`. To start the virtual machine from scratch, run `vagrant destroy`. See `vagrant help` for more options

Note: Running on Windows also requires [Python 2.7 for Windows](https://www.python.org/downloads/).  If you encounter any issues with the bcrypt module, there is a helpful Stack Overflow post [here.](http://stackoverflow.com/questions/14573488/error-compiling-bcrypt-node-js)
