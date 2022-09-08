import * as yup from "yup"
import { AnyObjectSchema } from "yup"


const initDatabase = (name = "db") => {
  function table<T>(name: string, schema: AnyObjectSchema) {
    const insert = (value: T) => { console.log(value) }
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
 */


let database = initDatabase()
type User = yup.InferType<typeof UserSchema>
const users = database.table<User>("users", UserSchema)

users.insert({ id: 0, firstName: "Theo", lastName: "Taylor", email: "theo@taylord.tech" })


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