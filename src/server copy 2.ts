import express from 'express';
import { buildSchema } from 'graphql';
import { graphqlHTTP } from 'express-graphql';

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type RandomDie {
    numSides: Int!
    rollOnce: Int!
    roll(numRolls: Int!): [Int]
  }

  type Query {
    getDie(numSides: Int): RandomDie
  }
`);

// This class implements the RandomDie GraphQL type
class RandomDie {
  numSides;
  constructor(numSides: number) {
    this.numSides = numSides;
  }

  rollOnce(): number {
    return 1 + Math.floor(Math.random() * this.numSides);
  }

  roll({ numRolls }: { numRolls: number }): number[] {
    const output = [];
    for (let i = 0; i < numRolls; i++) {
      output.push(this.rollOnce());
    }
    return output;
  }
}

// The rootValue provides a resolver function for each API endpoint
const rootValue = {
  getDie: ({ numSides }: { numSides: number }): RandomDie => {
    return new RandomDie(numSides || 6);
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
