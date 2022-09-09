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
import { useState, useEffect, FC } from "react"
import Animated, { FadeInUp, Layout, ZoomOut } from "react-native-reanimated"
import { initializeDatabase } from "./database"

const Row: FC<{ text: string; done: boolean; onPress: () => void; onLongPress: () => void }> = (props) => {
  return (
    <TouchableOpacity onPress={props.onPress} onLongPress={props.onLongPress}>
      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 6,
          paddingVertical: 12,
          paddingHorizontal: 8,
          marginBottom: 8,
          backgroundColor: "#f3f3f3",
        }}
        entering={FadeInUp}
        exiting={ZoomOut}
        layout={Layout.delay(200)}
      >
        <View style={{
          height: 24,
          width: 24,
          borderRadius: 12,
          borderColor: "#2191FB",
          borderWidth: props.done ? 0 : 4,
          backgroundColor: props.done ? "#63D471" : "transparent",
        }} />
        <Text style={{ marginLeft: 8, textDecorationLine: props.done ? "line-through" : "none", fontSize: 16 }}>{props.text}</Text>
      </Animated.View>
    </TouchableOpacity>
  )
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
      let result = await itemsTable.insert<Item>({ value: text, done: false, id: 0 })
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
      let update = await itemsTable.update(item.id, item)
      if (update.status != "success") return
      let result = await itemsTable.select()
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
      data: todo,
      count: todo.length
    },
    {
      title: "DONE",
      data: done,
      count: done.length
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.flexRow}>
        <TextInput
          onChangeText={(text) => setText(text)}
          onSubmitEditing={add}
          placeholder="Type new task..."
          placeholderTextColor="#757575"
          style={styles.input}
          value={text}
        />
      </View>
      <SectionList
        contentContainerStyle={styles.sectionContainer}
        sections={DATA}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Row text={item.value} done={item.done} onPress={() => markAsDone(item)} onLongPress={() => deleteItem(item.id)} />
        )}
        renderSectionHeader={({ section: { title, count } }) => (
          <Text style={styles.sectionHeading}>{title} ({count})</Text>
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
  flexRow: {
    flexDirection: "row",
  },
  input: {
    borderColor: "#ddd",
    borderRadius: 4,
    borderWidth: 2,
    flex: 1,
    height: 44,
    margin: 16,
    padding: 8,
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
