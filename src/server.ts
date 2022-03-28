import express from 'express';
import { buildSchema } from 'graphql';
import { graphqlHTTP } from 'express-graphql';

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Mutation {
    createMessage(input: MessageInput): Message
    updateMessage(id: ID!, input: MessageInput): Message
  }

  type Query { 
    getMessage(id: ID!): Message
  }

  type Message {
    id: ID!
    content: String
    author: String
  }

  input MessageInput {
    content: String
    author: String
  }
`);

class Message {
  public id: string;
  public author: string;
  public content: string;

  constructor(id: string, { author, content }: MessageInputType) {
    this.id = id;
    this.content = content;
    this.author = author;
  }
}

type MessageType = {
  [name: string]: Message;
};

type MessageInputType = {
  content: string;
  author: string;
};

const fakeDatabase: MessageType = {};
// The rootValue provides a resolver function for each API endpoint
const rootValue = {
  createMessage: ({ input }: { [name: string]: MessageInputType }) => {
    var id = require('crypto').randomBytes(10).toString('hex');
    const message = new Message(id, input);
    fakeDatabase[id] = message;
    return message;
  },
  updateMessage: ({ id, input }: { id: string; input: MessageInputType }) => {
    if (!fakeDatabase[id]) {
      throw new Error(`no message exists with id: ${id}`);
    }
    const message = fakeDatabase[id];
    message.author = input.author;
    message.content = input.content;
    fakeDatabase[id] = message;
    return message;
  },
  getMessage: (id: string) => {
    if (!fakeDatabase[id]) {
      throw new Error(`no message exists with id: ${id}`);
    }
    return fakeDatabase[id];
  },
};

const app = express();

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue,
    graphiql: true,
  })
);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Running a GraphQL API server at localhost:${port}/graphql`);
});
