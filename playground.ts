import * as yup from "yup"
import { AnyObjectSchema, AnySchema } from "yup"


const initDatabase = (name = "db", schemas: AnyObjectSchema[]) => { }
/*
Day 1 pt 2
Used yup to create a schema ans generate a TS type as well as Datatypes for SQLite
It was a pain
And the way I'm determining if a number field is an integer is kinda jank

*/

const UserSchema = yup.object({
  id: yup.number().integer().required(),
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  email: yup.string().required(),
})

const ProductSchema = yup.object({
  id: yup.number().integer().required(),
  name: yup.string().required(),
  price: yup.number().integer().required(),
  available: yup.bool().required(),
})

/**
 * Creates or connects the database of the given name with each schema representing a table.
 *
 * @param {string} name The name of the database.
 * @param {AnySchema[]} schemas The schemas to be mapped to tables.
 */

let db = initDatabase("local", [UserSchema, ProductSchema])


interface Product extends yup.InferType<typeof ProductSchema> {
  // using interface instead of type generally gives nicer editor feedback
}
// but types can also be written like this
//type Product = yup.InferType<typeof ProductSchema>

//console.log(Object.keys(ProductSchema.fields))

// testing TS stuff for generating a tyoe from object properties
type SchemaField = keyof typeof ProductSchema.fields

const bat = (a: SchemaField) => { }
//bat("f")

Object.keys(ProductSchema.fields).forEach((key) => {
  //if (key === undefined)
  const field = ProductSchema.fields[key as SchemaField]
  let type = field._type
  //console.log("TS", type)

  switch (type) {
    case "number":
      let isInt = false
      for (let test of field.describe().tests) {
        if (test.name === "integer") {
          isInt = true
          break
        }
      }
      if (isInt) type = "INTEGER"
      else type = "REAL"
      break
    case "string":
      type = "TEXT"
      break
    case "boolean":
      type = "INTEGER"
      break
  }

  //console.log("SQLite", type)
})

/*

Day 2

Setup process v0.0.1:
1 - initialize the db
2 - generate the schemas
3 - create the tables

*/
