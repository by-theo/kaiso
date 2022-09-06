 when we init the db we pass an array or models
 then we create tables for each model if it hasn't been created already
 split this into 2 parts, just get this initialization working (pt1) then we could think about type safety (pt2)

 but lets think about type safety for a bit, can i create a type from all the table names and then let that type be the parameter for .table()
 such that any other string gives an error? something to look into 

 if type safety is covered and we can perform CRUD operations then the next big goal is relationships

 andddd of course, don't forget migrations