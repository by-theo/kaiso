import { StatusBar } from "expo-status-bar"
import {
  ScrollView,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import Constants from "expo-constants"
import * as SQLite from "expo-sqlite"
import {
  AnyObjectSchema,
  InferType,
  object,
  string,
  number,
  boolean,
} from "yup"
import { useState, useEffect } from "react"

/**
 * Creates or connects the database of the given name with each schema representing a table.
 *
 * @param {string} name The name of the database.
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

    type TableType = InferType<typeof schema>

    const insert = async (value: TableType) => {
      const valid = await schema.isValid(value)
      /*
      if (!valid) {
        console.log("invalid")
        return
      }
      */

      const columns = Object.keys(value)
      /*const idIndex = columns.findIndex(checkForID)
      
      columns.splice(idIndex, 1)

      function checkForID(column: string) {
        return column === "id"
      }
      */

      let columnNames = ""
      let columnPlaceholders = ""
      let columnValues: any[] = []

      columns.forEach((column, index) => {
        columnNames += index === 0 ? column : `, ${column}`
        columnPlaceholders += index === 0 ? "?" : `, ?`
        columnValues.push(value[column])
      })

      console.log(value)
      let command = `INSERT INTO ${tableName} (${columnNames}) VALUES (${columnPlaceholders})`
      console.log(command)

      return new Promise((resolve) => {
        sqlDB.transaction((tx) => {
          tx.executeSql(
            command,
            columnValues,
            () => {
              resolve({ status: "success", data: value })
            },
            () => {
              resolve({ status: "failed", data: null })
              return false
            }
          )
        })
      })
    }

    const select = async () => {
      const command = `SELECT * FROM ${tableName};`
      return new Promise((resolve) => {
        sqlDB.transaction((tx) => {
          tx.executeSql(
            command,
            [],
            (_, { rows: { _array } }) => {
              resolve({ status: "success", data: _array })
            },
            () => {
              resolve({ status: "failed", data: null })
              return false
            }
          )
        })
      })
    }

    const update = (primaryKey: number, value: any) => {}

    const remove = (id: number) => {
      const command = `DELETE FROM ${tableName} WHERE id = ?;`
      sqlDB.transaction((tx) => {
        tx.executeSql(command, [id])
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

const Item = object({
  id: number().integer().required(),
  done: boolean().required(),
  value: string().required(),
})

type Item = InferType<typeof Item>

const itemsTable = initializeDatabase().table("items", Item)
export default function App() {
  const [text, setText] = useState("")
  const [items, setItems] = useState<Item[]>([])
  const add = async () => {
    try {
      let result = await itemsTable.insert({ value: text, done: false })
      if (result.status != "success") return
      result = await itemsTable.select()
      if (result.status != "success") return
      setItems(result.data as Item[])
    } catch (e) {
      console.log("error", e)
    }
    setText("")
  }

  const markAsDone = (id: number) => {}

  const deleteItem = (id: number) => {}

  useEffect(() => {
    itemsTable
      .select()
      .then((r) => {
        setItems(r.data as Item[])
      })
      .catch((e) => {
        console.log({ e })
      })
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.flexRow}>
        <TextInput
          onChangeText={(text) => setText(text)}
          onSubmitEditing={add}
          placeholder="what do you need to do?"
          style={styles.input}
          value={text}
        />
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Text>{item.value}</Text>}
      />
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  flexRow: {
    flexDirection: "row",
  },
  input: {
    borderColor: "#4630eb",
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    height: 48,
    margin: 16,
    padding: 8,
  },
  listArea: {
    backgroundColor: "#f0f0f0",
    flex: 1,
    paddingTop: 16,
  },
  sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionHeading: {
    fontSize: 18,
    marginBottom: 8,
  },
})
