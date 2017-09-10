# Listopia - A Book Catalog Web App

### About the Project
Listopia is a web application with a Flask back-end and a Bootstrap front-end that allows you to catalog your favourite books!

### Requirements
This app is still in development and currently requires to be run in a virtual machine (VM). This project is Project 4 of Udacity's Full-Stack Web Development Nanodegree, and as a result uses their VM configuration. Follow these instructions to run the project:

1. Download and install the VirtualBox platform package from [here](https://www.virtualbox.org/wiki/Downloads). (VirtualBox is the software that runs the virtual machine).
2. Download and install Vagrant from [here](https://www.vagrantup.com/downloads.html). (Vagrant is the software that configures the VM and lets you share files with your host computer).
3. Clone this repository into whichever directory with `git clone https://github.com/nehal96/full-stack-nd`. (Needs to have [Git](https://git-scm.com/downloads) installed).
4. Enter into that directory from your terminal with `cd path/to/directory`.
5. Once you're in the **full-stack-nd** directory, enter into the **P4-Catalog-Web-App** directory, and then into the **vagrant** directory with `cd P4-Catalog-Web-App/vagrant`.
6. Inside the vagrant sub-directory, run the command `vagrant up`. This will make Vagrant download the Linux operating system and install it for your virtual machine (your actual computer's OS will be unaffected). This may take a few minutes.
7. Once it has finished and your shell prompt is back, run the command `vagrant ssh` to log into your newly installed Linux virtual machine!

### How to Run this Project

1. If you haven't already, boot up virtual machine with `vagrant up` followed by `vagrant ssh`.
2. Once your in the VM, run the `cd /vagrant/catalog` command to access the shared files, specifically the ones in the `catalog` sub-directory.
3. Start running the local web server by executing the command: `python application.py`
4. Next, open up your favourite browser, and in the address/url line, type `http://localhost:8005`. This will talk to the web server you just started and will display the webpage.
5. Have fun using Listopia (v0.1)! 
