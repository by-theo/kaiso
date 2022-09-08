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

Day 4 
Learnt that "generating" types is not a thing and if I need that type of functionality I would need to use inferance
That was a huge pain in the ass but I managed to get it working so I can call `database.table("users", UserSchema)` then `users.insert({id: 0, firstName: "Theo", lastName: "Taylor", email: "t@taylord.tech"})` and have the type be inferred