/*
import { useState, useEffect } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Constants from "expo-constants";
import * as SQLite from "expo-sqlite";
import { StatusBar } from 'expo-status-bar';

function openDatabase() {
    const db = SQLite.openDatabase("db.db");
    return db;
}

const db = openDatabase();

const useDB = () => {
    const table = (name: string) => {
        const get = () => {
            const [items, setItems] = useState<any[]>()
            db.transaction((tx) => {
                tx.executeSql(
                    `SELECT * FROM ${name};`,
                    [],
                    (_, { rows: { _array } }) => setItems(_array)
                );
            });
            return items
        }

        const add = (value: any) => {
            db.transaction((tx) => {
                tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS ${name} (id INTEGER PRIMARY KEY NOT NULL, done int, value text);`
                );
                tx.executeSql("INSERT INTO items (done, value) values (0, ?)", [value]);
            });
        }

        return {
            get,
            add,
        }
    }

    return {
        table
    }
}

function Items({ done: doneHeading, onPressItem }: { done: any, onPressItem: (id: string) => void }) {
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                `SELECT * FROM items WHERE done = ?;`,
                [doneHeading ? 1 : 0],
                (_, { rows: { _array } }) => setItems(_array)
            );
        });
    }, []);

    const heading = doneHeading ? "Completed" : "Todo";

    if (items === null || items.length === 0) {
        return null;
    }

    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>{heading}</Text>
            {items.map(({ id, done, value }) => (
                <TouchableOpacity
                    key={id}
                    onPress={() => onPressItem && onPressItem(id)}
                    style={{
                        backgroundColor: done ? "#1c9963" : "#fff",
                        borderColor: "#000",
                        borderWidth: 1,
                        padding: 8,
                        marginBottom: 8
                    }}
                >
                    <Text style={{ color: done ? "#fff" : "#000" }}>{value}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

export default function App() {
    const [text, setText] = useState("");
    const [forceUpdate, forceUpdateId] = useForceUpdate();
    const database = useDB()
    /*
      useEffect(() => {
        db.transaction((tx) => {
          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY NOT NULL, done int, value text);"
          );
        });
      }, []);
      

const add = () => {
    // is text empty?
    if (text === null || text === "") {
        return false;
    }

    database.table("items").add(text)

    db.transaction(
        (tx) => {
            tx.executeSql("INSERT INTO items (done, value) values (0, ?)", [text]);
            tx.executeSql("SELECT * FROM items", [], (_, { rows }) =>
                console.log(JSON.stringify(rows))
            );
        },
        undefined,
        forceUpdate
    );

    setText("");
};

const markAsDone = (id: string) => {
    db.transaction(
        (tx) => {
            tx.executeSql(`UPDATE items SET done = 1 WHERE id = ?;`, [
                id,
            ]);
        },
        undefined,
        forceUpdate
    )
}

const deleteItem = (id: string) => {
    db.transaction(
        (tx) => {
            tx.executeSql(`DELETE FROM items WHERE id = ?;`, [id]);
        },
        undefined,
        forceUpdate
    )
}

return (
    <View style={styles.container}>
        <>
            <View style={styles.flexRow}>
                <TextInput
                    onChangeText={(text) => setText(text)}
                    onSubmitEditing={add}
                    placeholder="what do you need to do?"
                    style={styles.input}
                    value={text}
                />
            </View>
            <ScrollView style={styles.listArea}>
                <Items
                    key={`forceupdate-todo-${forceUpdateId}`}
                    done={false}
                    onPressItem={markAsDone} />
                <Items
                    done
                    key={`forceupdate-done-${forceUpdateId}`}
                    onPressItem={deleteItem}
                />
            </ScrollView>
        </>
        <StatusBar style="auto" />
    </View>
);
}

function useForceUpdate() {
    const [value, setValue] = useState(0);
    return [() => setValue(value + 1), value];
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
});


type Model = {
    name: string
    schema: "" // yup object schema 
}

* /

/*


 when we init the db we pass an array or models
 then we create tables for each model if it hasn't been created already
 split this into 2 parts, just get this initialization working (pt1) then we could think about type safety (pt2)

 but lets think about type safety for a bit, can i create a type from all the table names and then let that type be the parameter for .table()
 such that any other string gives an error? something to look into 

 if type safety is covered and we can perform CRUD operations then the next big goal is relationships

andddd of course, don't forget migrations


*/