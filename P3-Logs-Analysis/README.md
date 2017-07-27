# Logs Analysis

### About the Project

An SQL internal reporting tool that analyzes data from a newspaper site and answers a few questions.

### The Questions

1. What are the three most popular articles of all time?
2. Who are the most popular article authors of all time?
3. On which days did more than 1% of the requests lead to errors?

### Requirements

* Python 3.5
* PostgreSQL 9.5
* psycopg2 2.7.1

Alternatively, you could set up and run a virtual machine (VM), and then use Udacity's VM configuration (which will include all the above requirements) to run the project, by following these instructions:

1. Download and install the VirtualBox platform package from [here](https://www.virtualbox.org/wiki/Downloads). (VirtualBox is the software that runs the virtual machine).
2. Download and install Vagrant from [here](https://www.vagrantup.com/downloads.html). (Vagrant is the software that configures the VM and lets you share files with your host computer).
3. Download and unzip [this VM configuration](https://d17h27t6h515a5.cloudfront.net/topher/2017/June/5948287e_fsnd-virtual-machine/fsnd-virtual-machine.zip), alternatively you could clone the repository with `git clone https://github.com/udacity/fullstack-nanodegree-vm`.
4. Move the unzipped file wherever you wish, and then enter that directory from your terminal with `cd path/to/directory`.
5. Once you're in the **FSND-Virtual-Machine** directory, enter the **vagrant** directory with `cd vagrant`.
6. Inside the vagrant sub-directory, run the command `vagrant up`. This will make Vagrant download the Linux operating system and install it for your virtual machine (your actual computer's OS will be unaffected). This may take a few minutes.
7. Once it has finished and your shell prompt is back, run the command `vagrant ssh` to log into your newly installed Linux virtual machine!

### How to Run this Project

1. Open a new terminal and clone the repository with `git clone https://www.github.com/nehal96/full-stack-nd`
2. If you are using the virtual machine, move `setup_database.sql` and `newsreport.py` into the `vagrant` directory.
3. If you haven't already, boot up virtual machine with `vagrant up` followed by `vagrant ssh`, then `cd` into the `vagrant` directory.
4. Inside the VM, prepare the database by running the command: `psql -f setup_database.py`.
5. Next, execute the report file by running the command: `python3 newsreport.py`.

### The Program Design

The code in `newsreport.py` uses Python's `psycopg2` module to connect to the populated PostgreSQL database `news`, and runs three SQL statements that answer the three questions posted above. The terminal output is designed to be human-readable, so it prints the question followed by the answer. For the third question, three `views` were created to make the final SQL statement less complex, which will be shown below.

### The Views

* `successful`: This table shows the date and the number of successful requests for each day:

```sql
CREATE view successful as
    SELECT DATE(time), count(*) as success
    FROM log
    WHERE status = '200 OK'
    GROUP BY DATE(time);
```

* `failed`: This table shows the date and the number of failed requests for each day:

```sql
CREATE view failed as
    SELECT DATE(time), count(*) as fail
    FROM log
    WHERE status = '404 NOT FOUND'
    GROUP BY DATE(time);
```

* `percent_failed`: This table shows the date and the percentage of requests that failed for each day:

```sql
CREATE view percent_failed as
    SELECT total_status.date, ((total_status.fail / total_status.total::double precision) * 100) as percent
    FROM (SELECT successful.date, successful.success, failed.fail, successful.success + failed.fail as total
          FROM successful JOIN failed
          ON successful.date = failed.date) as total_status
    ORDER BY total_status.date;
```
