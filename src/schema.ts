type DataType = "TEXT" | "INTEGER" | "REAL"
type Field<N> = { value: N | null, dataType: DataType };

export type InferType<T> = {
  [k in keyof T]: T[k] extends Field<infer U> ? U : unknown;
}

export function number(dataType: DataType = "INTEGER"): Field<number> {
  return { value: null, dataType };
}
export function string(): Field<string> {
  return { value: null, dataType: "TEXT" };
}

const ExampleSpec = {
  id: number(),
  name: string(),
  description: string()
};

type ExampleType = InferType<typeof ExampleSpec>;

// ExampleType will be {  id: number; name: string; description: string }

type SchemaField = keyof typeof ExampleSpec

const ex: SchemaField = "id"

Object.keys(ExampleSpec).forEach((key) => {
  const y = typeof ExampleSpec[key as SchemaField]
  console.log(y)
})

const example: ExampleType = {
  id: 1,
  name: "Keychron K3 Mechanical Keyboard",
  description: ""
}

/*
const Post = schema({
  author: relation({table: "users", fields: ["authorId"], references: ["id"]}),
  title: string(),
  description: string(),
  something: number("REAL").default(1)
})

const Example = schema({
  author: relation({table: "users", fields: ["authorId"], references: ["id"]}),
  title: text(),
  description: text(),
  someRealNumber: real().default(1.2),
  someRealInteger: integer().default(1)
})
*/