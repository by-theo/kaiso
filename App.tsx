import { StatusBar } from "expo-status-bar"
import {
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import Constants from "expo-constants"
import {
  InferType,
  object,
  string,
  number,
  boolean,
} from "yup"
import { useState, useEffect } from "react"
import { initializeDatabase } from "./database"

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

  const markAsDone = async (item: Item) => {
    try {
      let result = await itemsTable.update(item.id, item)
      if (result.status != "success") return
      result = await itemsTable.select()
      if (result.status != "success") return
      setItems(result.data as Item[])
    } catch (e) {
      console.log("error", e)
    }
  }

  const deleteItem = async (id: number) => {
    try {
      let result = await itemsTable.delete(id)
      if (result.status != "success") return
      result = await itemsTable.select()
      if (result.status != "success") return
      setItems(result.data as Item[])
    } catch (e) {
      console.log("error", e)
    }
  }

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

  const todo = items.filter(item => !item.done)
  const done = items.filter(item => item.done)
  const DATA = [
    {
      title: "TODO",
      data: todo
    },
    {
      title: "DONE",
      data: done
    }
  ];

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
      <SectionList
        contentContainerStyle={styles.sectionContainer}
        sections={DATA}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              backgroundColor: item.done ? "#1c9963" : "#fff",
              borderColor: "#000",
              borderWidth: 1,
              padding: 8,
              marginBottom: 8
            }}
            onPress={() => markAsDone(item)} onLongPress={() => deleteItem(item.id)}>
            <Text>{item.value}</Text>
          </TouchableOpacity>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeading}>{title}</Text>
        )}
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
    backgroundColor: "#fff",
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
    fontSize: 13,
    fontWeight: "bold",
    paddingTop: 12,
    paddingBottom: 8,
    marginBottom: 2,
    backgroundColor: "#fff",
  },
})
