import * as SQLite from "expo-sqlite"
import {
    AnyObjectSchema,
    //InferType,
} from "yup"

type StandardResult = {
    status: "success" | "failure"
    data: any
}

/**
 * Creates or connects the database of the given name with each schema representing a table.
 *
 * @param {string} dbName The name of the database. 
 */

const initializeDatabase = (dbName = "main") => {
    const sqlDB = SQLite.openDatabase(`${dbName}.db`)
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

        sqlDB.transaction((tx) => {
            tx.executeSql(command)
        })

        //type TableType = InferType<typeof schema>

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

            //console.log(value)
            let command = `INSERT INTO ${tableName} (${columnNames}) VALUES (${columnPlaceholders})`
            //console.log(command)

            return new Promise<StandardResult>((resolve) => {
                sqlDB.transaction((tx) => {
                    tx.executeSql(
                        command,
                        columnValues,
                        () => {
                            resolve({ status: "success", data: value })
                        },
                        () => {
                            resolve({ status: "failure", data: null })
                            return false
                        }
                    )
                })
            })
        }

        const select = async () => {
            const command = `SELECT * FROM ${tableName};`
            return new Promise<StandardResult>((resolve) => {
                sqlDB.transaction((tx) => {
                    tx.executeSql(
                        command,
                        [],
                        (_, { rows: { _array } }) => {
                            resolve({ status: "success", data: _array })
                        },
                        () => {
                            resolve({ status: "failure", data: null })
                            return false
                        }
                    )
                })
            })
        }

        const update = async (id: number, value: any) => {
            const command = `UPDATE ${tableName} SET done = 1 WHERE id = ?;`
            return new Promise<StandardResult>((resolve) => {
                sqlDB.transaction((tx) => {
                    tx.executeSql(
                        command,
                        [id],
                        () => resolve({ status: "success", data: value }));
                })
            })
        }

        const remove = async (id: number) => {
            const command = `DELETE FROM ${tableName} WHERE id = ?;`
            return new Promise<StandardResult>((resolve) => {
                sqlDB.transaction((tx) => {
                    tx.executeSql(command, [id],
                        () => {
                            resolve({ status: "success", data: null })
                        },)
                })
            })
        }

        return {
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