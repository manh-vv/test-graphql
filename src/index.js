import { GraphQLServer } from 'graphql-yoga';
import DataLoader from 'dataloader';
import { userService } from './services/user';
import { postService } from './services/post';

const typeDefs = `
  type Post {
    title: String!
    content: String!
    userName: String!
    userStar: Int!
  }

  type Query {
    posts: [Post!]!
  }
`;

const resolvers = {
  Post: {
    userName: async ({ creator: userId }, params, context) => {
      const user = await context.dl.load(userId);
      return user.name;
    },
    userStar: async ({ creator: userId }, params, context) => {
      const user = await context.dl.load(userId);
      return user.star;
    },
  },

  Query: {
    posts: () => postService.find(),
  },
};

const server = new GraphQLServer(
  {
    typeDefs,
    resolvers,
    context: () => {
      return {
        dl: new DataLoader(userService.batchLoad),
      }
    }
  }
);

server.start(({ port }) => console.log(`Server is running on http://localhost:${port}`));
