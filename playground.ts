import * as yup from "yup"
import { AnyObjectSchema } from "yup"

/**
 * Creates or connects the database of the given name with each schema representing a table.
 *
 * @param {string} name The name of the database.
 */

const initializeDatabase = (name = "main") => {
  function table(tableName: string, schema: AnyObjectSchema) {
    let command = `CREATE TABLE IF NOT EXISTS ${tableName} (id INTEGER PRIMARY KEY NOT NULL`
    type SchemaField = keyof typeof schema.fields
    Object.keys(schema.fields).forEach((key) => {
      if (key === "id") return
      const field = schema.fields[key as SchemaField]
      let type = field._type

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
      command += `, ${key} ${type}`
    })
    command += ");"
    console.log(command)

    type TableType = yup.InferType<typeof schema>

    const insert = async (value: TableType) => {
      const valid = await schema.isValid(value)
      if (!valid) return

      console.log(value)
    }

    const update = (primaryKey: number, value: any) => {}
    const remove = (id: number) => {
      const command = `DELETE FROM ${tableName} WHERE id = ?;`
    }

    return {
      insert,
      delete: remove,
      update,
    }
  }

  return {
    table,
  }
}

const UserSchema = yup.object({
  id: yup.number().integer().required(),
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  email: yup.string().required(),
})

let database = initializeDatabase()
const users = database.table("users", UserSchema)

users.insert({
  id: 0,
  firstName: "Theo",
  lastName: "Taylor",
  email: "theo@taylord.tech",
})
