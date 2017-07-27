DROP DATABASE IF EXISTS news;

CREATE DATABASE news;

\c news

\i newsdata.sql

CREATE view successful as
    SELECT DATE(time), count(*) as success
    FROM log
    WHERE status = '200 OK'
    GROUP BY DATE(time);

CREATE view failed as
    SELECT DATE(time), count(*) as fail
    FROM log
    WHERE status = '404 NOT FOUND'
    GROUP BY DATE(time);

CREATE view percent_failed as
    SELECT total_status.date, ((total_status.fail / total_status.total::double precision) * 100) as percent
    FROM (SELECT successful.date, successful.success, failed.fail, successful.success + failed.fail as total
          FROM successful JOIN failed
          ON successful.date = failed.date) as total_status
    ORDER BY total_status.date;
