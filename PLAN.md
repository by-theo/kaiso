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
when we init the db we pass an array or models
then we create tables for each model if it hasn't been created already
split this into 2 parts, just get this initialization working (pt1) then we could think about typesafety (pt2)

but lets think about type safety for a bit, can i create a type from all the table names and thenlet that type be the parameter for .table()
such that any other string gives an error? something to look into 

if type safety is covered and we can perform CRUD operations then the next big goal is relationships

andddd of course, don't forget migrations