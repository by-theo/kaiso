import * as yup from "yup"
import { AnyObjectSchema, AnySchema } from "yup"


const initDatabase = (name = "db", schemas: AnyObjectSchema[]) => {
  const table = (name: string) => {


    const insert = (value: any) => { }
    const update = (primaryKey: number, value: any) => { }
    const remove = (primaryKey: number) => { }

    return {
      insert,
      delete: remove,
      update
    }
  }

  return {
    table
  }
}

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

let database = initDatabase("local", [UserSchema, ProductSchema])

// Adding a row
database.table("users").insert({ firstName: "Theo", lastName: "Taylor", email: "theo@taylord.tech" })

// Updating a row
database.table("users").update(0, { email: "theotaylor@taylord.tech" })

// Deleting a row
database.table("users").delete(0)


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