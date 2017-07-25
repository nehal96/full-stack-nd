# Logs Analysis

### About the Project

An SQL internal reporting tool that analyzes data from a newspaper site and answers a few questions.

### The Questions

1. What are the three most popular articles of all time?
2. Who are the most popular article authors of all time?
3. On which days did more than 1% of the requests lead to errors?

### How to Run this Project

After you have followed Udacity's instructions and installed the virtual machine and [downloaded the data](https://d17h27t6h515a5.cloudfront.net/topher/2016/August/57b5f748_newsdata/newsdata.zip) (and put it in the `vagrant` directory), and loaded the data into the database with `psql -d news -f newsdata.sql`:

1. Create the Views listed below in the `news` database.
2. Open a new terminal and Clone the repository with `git clone https://www.github.com/nehal96/full-stack-nd`
3. Move `newsreport.py` into the vagrant directory
4. Execute the file by running the command: `python3 newsreport.py`.

### The Program Design

The code in `newsreport.py` uses Python's `psycopg2` module to connect to the populated PostgreSQL database `news`, and runs three SQL statements that answer the three questions posted above. The terminal output is designed to be human-readable, so it prints the question followed by the answer. For the third question, 3 `views` were created to make the final SQL statement less complex, which will be shown below.

### The Views

* `successful`: This table shows the date and the number of successful requests for each day (ordered by descending order of requests to see the range of numbers):

```sql
CREATE view successful as
    SELECT DATE(time), count(*) as success
    FROM log
    WHERE status = '200 OK'
    GROUP BY DATE(time)
    ORDER BY success DESC;
```

* `failed`: This table shows the date and the number of failed requests for each day:

```sql
CREATE view failed as
    SELECT DATE(time), count(*) as fail
    FROM log
    WHERE status = '404 NOT FOUND'
    GROUP BY DATE(time)
    ORDER BY fail DESC;
```

* `percent_failed`: This table shows the date and the percentage of requests that failed for each day:

```sql
CREATE view percent_failed as
    SELECT total_status.date, ((total_status.fail::double precision / total_status.total::double precision) * 100) as percent
    FROM (SELECT successful.date, successful.success, failed.fail, successful.success + failed.fail as total
          FROM successful JOIN failed
          ON successful.date = failed.date
          ORDER BY date) as total_status
    ORDER BY total_status.date;
```
