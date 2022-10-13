//import * as SQLite from "expo-sqlite"
import {
  AnyObjectSchema
} from "yup"

type Status = "success" | "failure"

/**
 * Creates or connects the database of the given name with each schema representing a table.
 *
 * @param {string} dbName The name of the database. 
 * 
 */

const initializeDatabase = (dbName = "main") => {
  //const sqlDB = SQLite.openDatabase(`${dbName}.db`)
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

    // sqlDB.transaction((tx) => {
    //   tx.executeSql(command)
    // })

    const insert = async <T extends {}>(value: T) => {
      const valid = await schema.isValid(value)

      if (!valid) throw Error(`${JSON.stringify(value)} is not of the correcttype`)

      function checkForID(column: string) {
        return column === "id"
      }

      const columns = Object.keys(value)
      const idIndex = columns.findIndex(checkForID)
      if (idIndex >= 0) columns.splice(idIndex, 1)

      let columnNames = ""
      let columnPlaceholders = ""
      let columnValues: any[] = []

      columns.forEach((column, index) => {
        columnNames += index === 0 ? column : `, ${column}`
        columnPlaceholders += index === 0 ? "?" : `, ?`
        columnValues.push(value[column as keyof T])
      })

      let command = `INSERT INTO ${tableName} (${columnNames}) VALUES (${columnPlaceholders})`

      return new Promise<{ status: Status, data: T | null }>((resolve) => {
        // sqlDB.transaction((tx) => {
        //   tx.executeSql(
        //     command,
        //     columnValues,
        //     () => {
        //       resolve({ status: "success", data: value })
        //     },
        //     () => {
        //       resolve({ status: "failure", data: null })
        //       return false
        //     }
        //   )
        // })
      })
    }

    const select = async <T>() => {
      const command = `SELECT * FROM ${tableName};`
      return new Promise<{ status: Status, data: T[] | null }>((resolve) => {
        // sqlDB.transaction((tx) => {
        //   tx.executeSql(
        //     command,
        //     [],
        //     (_, { rows: { _array } }: { rows: { _array: T[] } }) => {
        //       resolve({ status: "success", data: _array })
        //     },
        //     () => {
        //       resolve({ status: "failure", data: null })
        //       return false
        //     }
        //   )
        // })
      })
    }

    const columns = async <T>(columns: (keyof T)[]) => {
      let columnStr = ""
      columns.forEach((column, index) => {
        columnStr += index === 0 ? column.toString() : `, ${column.toString()}`
      })
      const command = `SELECT ${columnStr} FROM ${tableName};`
      return new Promise<{ status: Status, data: T[] | null }>((resolve) => {
        // sqlDB.transaction((tx) => {
        //   tx.executeSql(
        //     command,
        //     [],
        //     (_, { rows: { _array } }: { rows: { _array: T[] } }) => {
        //       resolve({ status: "success", data: _array })
        //     },
        //     () => {
        //       resolve({ status: "failure", data: null })
        //       return false
        //     }
        //   )
        // })
      })
    }

    const update = async <T>(id: number, value: T) => {
      const command = `UPDATE ${tableName} SET done = 1 WHERE id = ?;`
      return new Promise<{ status: Status, data: T }>((resolve) => {
        // sqlDB.transaction((tx) => {
        //   tx.executeSql(
        //     command,
        //     [id],
        //     () => resolve({ status: "success", data: value }));
        // })
      })
    }

    const remove = async (id: number) => {
      const command = `DELETE FROM ${tableName} WHERE id = ?;`
      return new Promise<{ status: Status, data: null }>((resolve) => {
        // sqlDB.transaction((tx) => {
        //   tx.executeSql(command, [id],
        //     () => {
        //       resolve({ status: "success", data: null })
        //     },
        //     () => {
        //       resolve({ status: "failure", data: null })
        //       return false
        //     })
        // })
      })
    }

    return {
      columns,
      insert,
      delete: remove,
      select,
      update,
    }
  }

  return {
    table,
  }
}


export { initializeDatabase }
import {
  InferType,
  object,
  string,
  number,
  boolean,
} from "yup"

const User = object({
  id: number().integer().required().meta({}),
  email: string().required(),
})

const Post = object({
  author: number().meta({ relations: { table: "users", fields: ["authorId"], references: ["id"] } }),
  title: string(),
  content: string(),
})

//console.log(Post.fields.author.describe().meta.relations.table);



/** 
 * 
 * Usage
 * 
    const Item = object({
        id: number().integer().required(),
        done: boolean().required(),
        value: string().required(),
    })

    type Item = InferType<typeof Item>
    type SubItem = Pick<Item, "done" | "id">
    initializeDatabase("test").table("items", Item).columns<SubItem>(["done", "id"]).then(result => console.log(result))

**/