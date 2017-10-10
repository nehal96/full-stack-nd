# Linux Server Configuration

## Summary

These are the steps taken to configure an Ubuntu Linux server to run a Flask web application with a PostgreSQL database. Specifically, the Flask application is the Catalog Web Application project, which I've named Listopia, and the server is hosted on Amazon Lightsail.

- IP Address: 54.213.60.230
- SSH port: 2200


## Steps

### SSH from Terminal

* **Configure SSH from Terminal**:
  1. Download your default private key from your Amazon Lightsail account by clicking on `Account > SSH keys > Download`.

  2. On Terminal, first change the permissions for using the private key by running the command `chmod 400 /path/to/your/key/**.pem`. (`**.pem` is a placeholder for the private key name, a file which ends with `.pem`).

  3. To SSH into your server, run the command `ssh -i /path/to/your/key/**.pem ubuntu@XX.XXX.XX.XXX`, where `XX.XXX.XX.XXX` is the IP address of your server.

  4. Now you can log onto your server from Terminal. The above command is going to change a bit later, when we change the default SSH port from `22` to `2200`.

### Securing the Server

* **Update all currently installed packages**:
  1. Run the command `sudo apt-get update` to check all available packages and its versions.

  2. Run the command `sudo apt-get upgrade` to check which packages can be upgraded. Enter `Y` when prompted to continue with the upgrading.

* **Change SSH port from 22 to 2200**:
  1. First, enable the 2200 port on Amazon Lightsail so we won't get locked out of the server. Go on your Lightsail server interface, click on the `Networking` tab, go to the `Firewall` sub-section which has SSH and HTTP and click `Add Another`. Put 'Application' as `Custom`, 'Protocol' as `TCP`, and in 'Port' enter `2200`.

  2. Edit the SSH config file to change the Port No. from 22 to 2200. Run the command `sudo nano /etc/ssh/sshd_config` to open up an editor on Terminal. On Line 5, change `Port 22` to `Port 2200`, save the file and then exit.

  3. Run `sudo service ssh restart` to restart the re-run the ssh config.

* **Setup firewall settings**:
  1. Run `sudo ufw status` to check the status of the firewall. Should read `inactive`.

  2. Run `sudo ufw default deny incoming` to set the firewall default to block all incoming connections.

  3. Run `sudo ufw default allow outgoing` to set the firewall default to allow all outgoing connections.

  4. Run `sudo ufw allow ssh` to set the firewall to allow ssh.

  5. Run `sudo ufw allow www` to set the firewall to allow default HTTP (port 80) connections.

  6. Run `sudo ufw allow 2200/tcp` to allow ssh connections on port 2200.

  7. Run `sudo ufw allow 123/udp` to allow NTP.

  8. Run `sudo ufw deny 22` to deny default ssh (we've changed the port from 22 to 2200, so we don't want port 22 to be open).

  9. Run `sudo ufw enable` to enable the firewall. You might get a prompt mentioning ssh disruptions. Enter `Y`.

  10. Run `sudo ufw status` again to check the status again. The response should look like this:

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
