declare module "*.json" {
  interface Person {
    id: string,
    group: string
  }
  type Relation = {
    id?: string,
    source: string;
    target: string;
    value: number;
  }
  const content: {
    links: Array<Relation>,
    nodes: Array<Person>
  };
  export default content;
}