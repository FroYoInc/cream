# Installation Instructions
The following are installation instructions for installing Corpool, a corporate carpooling cooridination web application. There are two pieces to Corpool, the front end (sprinkles) and a back end (wafflecone).

### Prerequisites
These install instructions assume that you already have a server up and running, along with terminal (ssh) access as well.

The server should also have `git` (obtained through `yum`, `rpm`, etc.) and some sort of text editor installed as well (such as `vim`).

### 1) Install nginx
The first step is to [install nginx](http://wiki.nginx.org/Install). We use nginx because it makes it easy to forward requests to another location transparently.

### 2) Setup proxy in nginx
This step requires you to locate the `virtual.conf` file in the nginx install location, on CentOS it's path is: `/etc/nginx/conf.d/virtual.conf`.

Once located, open it up and add the following:

```
server {
    listen 80;
    server_name {APPLICATION_URL_HERE};

    location / {
        root {APPLICATION_ROOT_HERE};
        index index.html index.htm;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
    }
}
```

Replace `{APPLICATION_URL_HERE}` with the root URL that the application will be accessible at (such as www.example.com). Then replace `{APPLICATION_ROOT_HERE}` with a path to where the `/public_html/` folder will reside, such as `/var/www/example.com/public_html/`.

### 3) Set permissions on the `public_html` directory.
Be sure that you have created the entire path to the `{APPLICATION_ROOT_HERE}`, then run:
```
sudo chown -R www:www {APPLICATION_ROOT_HERE}
```

Then:
```
sudo chmod 0755 {APPLICATION_ROOT_HERE}
```

### 4) Install RethinkDB
Now go through the process of [installing RethinkDB](http://rethinkdb.com/docs/install/). You can read how to get it [running as well here](http://rethinkdb.com/docs/start-a-server/).

RethinkDB may also need to be secured on the server as well (there is a management portal which would allow anyone to acccess and modify the database if not secured), you can read [Secure your cluster](http://www.rethinkdb.com/docs/security/) for more information.

### 5) Install Node.js/npm
The backend of Corpool requires Node.js, along with the package manager `npm`.

On CentOS you can do so using `yum`:
```
sudo yum install npm
```

### 6) Install gulp
Next up, install `gulp` through `npm`:
```
npm install gulp -g
```

### 7) Clone `wafflecone`
It's now time to obtain the backend portion of Corpool. Be sure to `cd` into the parent directory of the `public_html` directory created earlier.

Now run:
```
git clone https://github.com/FroYoInc/wafflecone.git
cd wafflecone/
```
By default it should checkout the `develop` branch, do a `git checkout master` to get the latest stable release.

### 8) Run npm
Within the `wafflecone` directory that was just checked out, run:
```
npm install
```
After a few minutes the process should be completed.

### 9) Setup some basic configurations
Open up the `config.ts` file found within `src/config.ts` in your favorite text editor.

There you will find various settings such as:
- Database configuration for RethinkDB (defaults should be just fine)
- The application port and baseurl (the port should be left alone, as modifying it requires a change to the nginx `virtual.conf` file -- however the baseurl should match the application base URL). There is also an activationUrl,
which simply needs to be in the format of: `htp://[BASEURL]/api/activate/`.
- The number of rounds the salt is passed through before completing.
- Login lockout settings (number of tries and the lockout time).
- Minimum and maximum user name lengths.
- Domain whitelist (you must add your corporate email domains to this list, as only people with email addresses on the domain whitelist may register).
- SMTP settings, this object has options described on the [nodemailer usage page](https://github.com/andris9/nodemailer-smtp-transport#usage).

The domain whitelist and SMTP settings are those of special interest -- as the whitelist tells the backend which email address domains to allow to be registered. The SMTP settings are important too, as if not properly configured users will not be able to receive activation emails.

__Warning:__ If you modify SMTP settings (among others), the backend application will have to be restarted for the changes to take effect.

### 10) Start the backend
Now, within the `wafflecone` root directory, run:
```
gulp &
```

This will execute the unit tests and start up the backend, it should continue running in the background. The API should also be accessible at `{APPLICATION_URL_HERE}/api/`.

### 11) Clone `sprinkles`
The front end of Corpool now needs to be setup, which first requires cloning the project locally:
```
git clone https://github.com/FroYoInc/sprinkles.git
cd sprinkles/
```

### 12) Install `sprinkles` dependencies
There are a few utilities which are required to install the dependencies of the front end.
Run these commands first:
```
npm install bower -g
npm install tsd -g
```

Now run all of the following:
```
npm install
tsd reinstall
bower install
```

The first installs any npm packages required by the front end to build (which we will do soon).
The next downloads some TypeScript definition files (also required for the build to work),
the last downloads things such as AngularJS's source.

### 13) Build `sprinkles`
Simply run, within the `sprinkles` directory:
```
gulp build
```

This transpiles the TypeScript into JavaScript, among other tasks.

### 14) Move `dist` to `public_html`
In the previous step we ran `gulp build`, which not only transpiled TypeScript to
JavaScript, but it also moved anything required for the front end to work within the `dist` folder.

If you cloned `sprinkles` locally, upload the `dist` folder and it's contents into the `public_html`
folder (the index.html should be at the root of `public_html`). However, if you
cloned `sprinkles` on the server itself, copy those to the `public_html` directory
(the `cp -r [SRC] [DEST]` command might be useful).

### 15) Enjoy!
If all went well, you should now be able to point your browser to wherever the
`public_html` directory is accessible and everything should be up and running.
