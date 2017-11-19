# Linux Server Configuration

## Summary

These are the steps taken to configure an Ubuntu Linux server to run a Flask web application with a PostgreSQL database. Specifically, the Flask application is the Catalog Web Application project, which I've named Listopia, and the server is hosted on Amazon Lightsail.

- IP Address: 54.213.60.230
- SSH port: 2200


## Steps

### SSH from Terminal

**Configure SSH from Terminal**:
  1. Download your default private key from your Amazon Lightsail account by clicking on `Account > SSH keys > Download`.

  2. On Terminal, first change the permissions for using the private key by running the command `chmod 400 /path/to/your/key/**.pem`. (`**.pem` is a placeholder for the private key name, a file which ends with `.pem`).

  3. To SSH into your server, run the command `ssh -i /path/to/your/key/**.pem ubuntu@XX.XXX.XX.XXX`, where `XX.XXX.XX.XXX` is the IP address of your server.

  4. Now you can log onto your server from Terminal. The above command is going to change a bit later, when we change the default SSH port from `22` to `2200`.

### Securing the Server

**Update all currently installed packages**:
  1. Run the command `sudo apt-get update` to check all available packages and its versions.

  2. Run the command `sudo apt-get upgrade` to check which packages can be upgraded. Enter `Y` when prompted to continue with the upgrading.

**Change SSH port from 22 to 2200**:
  1. First, enable the 2200 port on Amazon Lightsail so we won't get locked out of the server. Go on your Lightsail server interface, click on the `Networking` tab, go to the `Firewall` sub-section which has SSH and HTTP and click `Add Another`. Put 'Application' as `Custom`, 'Protocol' as `TCP`, and in 'Port' enter `2200`.

  2. Edit the SSH config file to change the Port No. from 22 to 2200. Run the command `sudo nano /etc/ssh/sshd_config` to open up an editor on Terminal. On Line 5, change `Port 22` to `Port 2200`, save the file and then exit.

  3. Run `sudo service ssh restart` to restart the re-run the ssh config.

**Setup firewall settings**:
Run the following commands:
  1. `sudo ufw status` to check the status of the firewall. (Should read `inactive`).

  2. `sudo ufw default deny incoming` to set the firewall default to block all incoming connections.

  3. `sudo ufw default allow outgoing` to set the firewall default to allow all outgoing connections.

  4. `sudo ufw allow ssh` to set the firewall to allow ssh.

  5. `sudo ufw allow www` to set the firewall to allow default HTTP (port 80) connections.

  6. `sudo ufw allow 2200/tcp` to allow ssh connections on port 2200.

  7. `sudo ufw allow 123/udp` to allow NTP.

  8. `sudo ufw deny 22` to deny default ssh (we've changed the port from 22 to 2200, so we don't want port 22 to be open).

  9. `sudo ufw enable` to enable the firewall. You might get a prompt mentioning ssh disruptions. Enter `Y`.

  10. `sudo ufw status` again to check the status again. The response should look like this:

    ```
    Status: active

    To                    Allow       FROM
    --                    -----       ----
    22                    DENY        Anywhere
    80/tcp                ALLOW       Anywhere
    2200/tcp              ALLOW       Anywhere
    123/udp               ALLOW       Anywhere
    22 (v6)               DENY        Anywhere (v6)
    80/tcp (v6)           ALLOW       Anywhere (v6)
    2200/tcp (v6)         ALLOW       Anywhere (v6)
    123/udp (v6)          ALLOW       Anywhere (v6)
    ```

  11. From Terminal, exit the SSH connection by running `logout` or pressing `^D` (Control + D).

  Now when you log back on, the command to run is slightly different. Namely, you have to add a `-p 2200` flag at the end to specify the port you're connecting to. The full command is now:
  `ssh -i /path/to/your/key/**.pem ubuntu@XX.XXX.XX.XXX -p 2200`. Running the old command will result in an operation timeout error because port 22 has been closed.

### Creating the Grader User

**Create new user `grader`:**
  1. Run `sudo adduser grader` to create a new user named grader.
  2. Enter and re-enter UNIX password.
  3. Fill out user information. I've just filled out the name as 'Udacity Grader'.
  4. You can switch into the `grader` profile with `su - grader`.

**Give `grader` sudo access:**
  1. While in the `ubuntu` user, check the `sudoers.d` directory with `sudo ls /etc/sudoers.d`. This is where we should add any additional user permission instructions.
  2. Create a new file with `sudo nano /etc/sudoers.d/grader` and in the empty file, on the first line, type: ```grader ALL=(ALL) NOPASSWD:ALL```

**Authenticating with Public Key Encryption:**
  1. Generate a public-private key pair with the `ssh-keygen` application. Run `ssh-keygen` on your own computer (not on the Amazon server) to begin.
  2. A prompt will appear that asks for a filename. Use the same default path (on Mac, should be `/Users/<name of your computer>/.ssh/`) and make the filename `grader`. So finally, it will be `/Users/<name of your computer>/.ssh/linux-grader`.
  3. The terminal will ask for a passphrase. Enter any passphrase you like.
  4. After that, two files will be created: `linux-grader` and `linux-grader.pub` in my case. The application will also print out the key fingerprint and the key's randomart image.
  5. Now that we've created a local key, we need to put the public key onto the server. First, we need to enter the `grader` profile. Do that by entering `sudo su - grader`.
  6. Run `mkdir .ssh` to create a new directory that'll store public key related files.
  7. Run `touch .ssh/authorized_keys` to stores the public keys this account is allowed to use for authentication.
  8. Now on your local machine, run `cat .ssh/linux-grader.pub` (or whatever you've called it) to print out the contents of the file. Copy the entire key that's shown.
  9. Run `sudo nano .ssh/authorized_keys` and in the editor, paste the contents of the key you just copied, save, and exit.
  10. As a security measure, the next steps are to add a few file permissions: run `chmod 700 .ssh` and `chmod 644 .ssh/authorized_keys`.
  11. To test if everything's gone right, login with the grader using the command `ssh -i ~/.ssh/linux-grader grader@XX.XXX.XX.XXX -p 2200`. Enter the passphrase, and you should be able to access as `grader`!


### Configuring Local Timezone to UTC
  1. Run `sudo dpkg-reconfigure tzdata` to bring up timezone reconfiguration.
  2. In the country selection list, select `None of the above`, then select `UTC`.


### Configuring the Server
**Install and configure Apache:**
  1. Run `sudo apt-get install apache2` to install Apache.
  2. Test install by pasting the public IP of your Amazon Lightsail instance into any browser's URL field. The default Apache page should load if it's been installed correctly.

**Install and configure mod_wsgi package:**
  1. Run `sudo apt-get install libapache2-mod-wsgi python-dev` to install mod_wsgi. The package allows Apache to host Flask applications.

**Install PostgreSQL and disable remote connections:**
  1. Run `sudo apt-get install postgresql` to install PostgreSQL.
  2. Disabled remote connections are default after installation, but we can double check by looking in the host based authentication file with `sudo nano /etc/postgresql/9.5/main/pg_hba.conf`. It should look like this:

  ```
  # Database administrative login by Unix domain socket
  local   all             postgres                                peer

  # TYPE  DATABASE        USER            ADDRESS                 METHOD

  # "local" is for Unix domain socket connections only
  local   all             all                                     peer

  # IPv4 local connections:
  host    all             all             127.0.0.1/32            md5

  # IPv6 local connections:
  host    all             all             ::1/128                 md5
  ```

  The first two non-commented lines are local in their scope (under `TYPE` heading). The other two non-commented lines are for remote hosts, but if you look in the `ADDRESS` column, you'll see they are local addresses too (`127.0.0.1/32` and `::1/128`).

**Create database user `catalog` with limited permissions:**
  1. During installation, PostgreSQL creates a default user `postgres` to operate under. Log into this user with the command `sudo su - postgres`.
  2. Log into the PostgreSQL prompt interface with the command `psql`.
  3. In the prompt interface, create user named catalog with the command `CREATE USER catalog;`.
  4. Give the `catalog` user database creation permissions with the command `ALTER ROLE catalog CREATEDB;`
  5. [Optional] Run `\du` to check user/role information. It should look like this:
    ```
                                        List of roles
      Role name |                         Attributes                         | Member of
      -----------+------------------------------------------------------------+-----------
      catalog   | Create DB                                                  | {}
      postgres  | Superuser, Create role, Create DB, Replication, Bypass RLS | {}

    ```
  5. Exit the prompt interface by running `\q`.
  6. Switch to main user `ubuntu` by running `logout`.

**Create Linux user 'catalog':**
  1. Create a new Linux user with `sudo adduser catalog`. Complete all the steps (creating password, filling out info).
  2. Give user `catalog` sudo permissions by:
    - Add a new file in the `sudoers.d` directory with `sudo nano /etc/sudoers.d/catalog`.
    - In the file, add the following: `catalog ALL=(ALL:ALL) ALL`
  3. Check if `catalog` has sudo permissions by switching to the user (run `sudo su - catalog`), and then run `sudo -l`. Put in the password, and a result should appear that displays the same permission information as above (`(ALL : ALL) ALL`).
  4. While logged in as `catalog`, create a new database named `catalog` with `createdb catalog`.
  5. Enter PostgreSQL with `psql` and run `\l` to check if the new database has been created.
  6. Run `\q` to exit PostreSQL.
  7. Run `logout` to go back to the being `ubuntu`.

**Install Git:**
  1. Run `sudo apt-get install git` to install Git.


### Cloning and Setting Up Catalog App
**Clone Listopia:**
  1. Create a new directory called `listopia` in the `/var/www` directory (Run the command `sudo mkdir listopia`).
  2. Enter the directory, and clone the item catalog project with `sudo git clone https://github.com/nehal96/listopia.git`.
  3. Change the name of `application.py` to `__init__.py` by running `sudo mv application.py __init__.py`.
  4. Enter `__init__.py` and go to the bottom of the file. Remove the `app.debug` and `app.secret_key` variables and change `app.run(port=8000)` to just `app.run()`.

**Create a Virtual Environment and Install Packages:**
  1. Install pip with `sudo apt-get install python-pip`
  2. Install virtualenv with `sudo apt-get install python-virtualenv`
  3. Enter the directory `/var/www/listopia/listopia/` and create a virtual environment with the command `virtualenv venv`.
  4. Activate the virtual environment with `source venv/bin/activate`.
  5. While inside the virtual environment, install the following packages:
    - `pip install flask`
    - `pip install httplib2`
    - `pip install sqlalchemy`
    - `pip install requests`
    - `pip install --upgrade oauth2client`
    - `pip install psycopg2`
    - `pip install google`
    - `pip instll google_auth_oauthlib`
  6. Test if everything is working all right by running the `__init__.py` file. If you get `Running on http://127.0.0.1:5000/`, that means there's no dependency issues.
  7. Exit and deactivate virtual environment with command `deactivate`.

**Set up Virtual Host:**
  1. Enter the apache2 directory with `cd /etc/apache2/sites-available/`
  2. Create and enter configuration file with `sudo nano listopia.conf`
  3. Inside the file, add the following:
    ```
    <VirtualHost *:80>
      ServerName XX.XXX.XX.XXX
      ServerAdmin ubuntu@XX.XXX.XX.XXX
      WSGI ScriptAlias / /var/www/listopia/listopia.wsgi
      <Directory /var/www/listopia/listopia/>
        Order allow,deny
        Allow from all
      </Directory>
      Alias /static /var/www/listopia/listopia/static
      <Directory /var/www/listopia/listopia/static/>
        Order allow,deny
        Allow from all
      </Directory>
      ErrorLog ${APACHE_LOG_DIR}/error.log
      LogLevel warn
      CustomLog ${APACHE_LOG_DIR}/access.log combined
    </VirtualHost>
    ```
  4. Enable the virtual host with `sudo a2ensite listopia`. You'll get the following response:
    ```
    Enabling site listopia.
    To activate the new configuration, you need to run:
      service apache2 reload
    ```
  We'll do this after we've set up the `listopia.wsgi` file.

**Create the WSGI file:**
  1. Go to the listopia directory with `cd /var/www/listopia`
  2. Create the file with `sudo nano listopia.wsgi`
  3. Add the following in the file:
    ```
    #!/usr/bin/python
    import sys
    import logging

    logging.basicConfig(stream=sys.stderr)
    sys.path.insert(0,"/var/www/listopia/")

    from listopia import app as application
    application.secret_key = 'super_secret_key'
    ```
  4. Restart Apache server with `sudo service apache2 restart`
