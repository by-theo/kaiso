type Field<N> = { value: N | null };

export type InferType<T> = {
  [k in keyof T]: T[k] extends Field<infer U> ? U : unknown;
}

export function number(): Field<number> {
  return { value: null };
}
export function string(): Field<string> {
  return { value: null };
}

const ExampleSpec = {
  id: number(),
  name: string(),
  description: string()
};

type ExampleType = InferType<typeof ExampleSpec>;

// ExampleType will be {  id: number; name: string; description: string }