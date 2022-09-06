Day 1 pt 2
Used yup to create a schema ans generate a TS type as well as Datatypes for SQLite
It was a pain
And the way I'm determining if a number field is an integer is kinda jank

Day 2
Setup process v0.0.1:
1 - initialize the db
2 - generate the schemas
3 - create the tables

Day 3
Figure out how to generate a type from an array so that when database.table("table_name") is called the table_name is matches a schema that has been defined and passed when the database was initialized
