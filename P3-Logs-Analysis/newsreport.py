#!/usr/bin/env python3

import psycopg2

print("NEWS REPORT \n\n")
DBNAME = "news"


conn = psycopg2.connect(dbname=DBNAME)  # Connect to database
cur = conn.cursor()  # Create cursor object

# SQL statement for Question 1
cur.execute("""SELECT articles.title as "Name of article", viewcount.views as
                      "Views"
               FROM articles,
                  (SELECT path, count(*) as views
                   FROM log
                   GROUP BY path
                   ORDER BY views DESC)
                   as viewcount
             WHERE viewcount.path = '/article/' || articles.slug
             LIMIT 3;""")
# Print question and answer
print("Question 1: What are the three most popular articles of all time? \n")

result = cur.fetchall()
for i, (title, views) in enumerate(result):
    print("{}. {}: {} views".format(i+1, title, views))

print("\n\n")


# SQL statement for Question 2
cur.execute("""SELECT authors.name as "Author Name", SUM(viewcount.views) as
                      "Total Views"
               FROM authors JOIN articles
               ON authors.id = articles.author
               JOIN (SELECT path, count(*) as views
                     FROM log
                     GROUP BY path
                     ORDER BY views DESC) as viewcount
               ON viewcount.path = '/article/' || articles.slug
               GROUP BY authors.name
               ORDER BY "Total Views" DESC;""")
# Print question and answer
print("Question 2: Who are the most popular article authors of all time? \n")

result = cur.fetchall()
for i, (author, views) in enumerate(result):
    print("{}. {}: {} views".format(i+1, author, views))

print("\n\n")

# SQL statement for Question 3
# See README for the 3 views created and used in this SQL statement:
# successful, failed, and percent_failed
cur.execute("""SELECT to_char(date, 'Month DD, YYYY'), percent
               FROM percent_failed
               WHERE percent > 1;""")
# Print question and answer
print("Question 3: On which days did more than 1% of the requests lead \
       to errors? \n")

result = cur.fetchall()
for i, (date, percent) in enumerate(result):
    print("{}. {}: {}%".format(i+1, date, percent))

print("\n\n")

# Close connection to database
conn.close()
