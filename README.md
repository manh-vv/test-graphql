# Test graphql

Still wonder how dataloader prevent us from N+1. Let's do this example.

## Problem

We have `User` and `Post`. Here, each post is belong to a user.

```text
User {
  id
  name
  star
}

Post {
  id
  title
  content

  # userId
  creator
}
```

In GraphQL we have type Post which contains some information from user.

```graphql
type Post {
  title: String!
  content: String!
  userName: String!
  userStar: Int!
}

type Query {
  posts: [Post!]!
}
```

We want to execute query:

```graphql
query {
  posts {
    title
    userName
    userStar
  }
}
```

Normal resolver will look like this:

```javascript
const resolvers = {
  Post: {
    userName: async ({ creator: userId }, params, context) => {
      const user = await userService.findById(userId);
      return user.name;
    },
    userStar: async ({ creator: userId }, params, context) => {
      const user = await userService.findById(userId);
      return user.star;
    }
  },

  Query: {
    posts: () => postService.find()
  }
};
```

Console screen will print out this:

```text
Post -- find
User -- findById 36cf531b-6153-4940-a9e9-bc2465d2e945
User -- findById 36cf531b-6153-4940-a9e9-bc2465d2e945
User -- findById 5a7dbbf4-acb7-46f3-9e10-07581fb2d2b7
User -- findById 5a7dbbf4-acb7-46f3-9e10-07581fb2d2b7
User -- findById 735000d2-3acd-4dfc-b531-8616fb84633c
User -- findById 735000d2-3acd-4dfc-b531-8616fb84633c
User -- findById 47e840b9-da4a-4ad2-b655-3a8a2abab91c
User -- findById 47e840b9-da4a-4ad2-b655-3a8a2abab91c
User -- findById ae0c762b-6c0b-4494-99fd-1b6eed37371c
User -- findById ae0c762b-6c0b-4494-99fd-1b6eed37371c
```

You can see there will be one fetching user for each post.
This is because for each post GraphQL will execute resolver
of `userName` and `userStar`.

## Apply dataloader

Resolvers which use `dataloader` will look like this.

```javascript
const resolvers = {
  Post: {
    userName: async ({ creator: userId }, params, context) => {
      const user = await context.dl.load(userId);
      return user.name;
    },
    userStar: async ({ creator: userId }, params, context) => {
      const user = await context.dl.load(userId);
      return user.star;
    }
  },

  Query: {
    posts: () => postService.find()
  }
};
```

At first I thought the log would look like this:

```text
Post -- find

User -- batchLoad [ '9838092d-8f93-4824-8a7a-4f8ac9aa779a' ]
User -- batchLoad [ 'a04e4b45-f310-41cb-b176-e3b8125626fc' ]
User -- batchLoad [ 'd5fdf076-db5c-4391-b8d9-d10b7cb83c3d' ]
User -- batchLoad [ '52028a74-a584-4255-b9ee-f0a54651755d' ]
User -- batchLoad [ '1e8a9926-8d38-494d-8ecd-66345645b3d5' ]
```

Because dataloader has cache. First, `userName` is executed
and user data is cached. Then, `userStar` is executed without
need of refetch user data.

However, console screen will print out this:

```text
Post -- find
User -- batchLoad [ '9838092d-8f93-4824-8a7a-4f8ac9aa779a',
  'a04e4b45-f310-41cb-b176-e3b8125626fc',
  'd5fdf076-db5c-4391-b8d9-d10b7cb83c3d',
  '52028a74-a584-4255-b9ee-f0a54651755d',
  '1e8a9926-8d38-494d-8ecd-66345645b3d5' ]
```

All fetch of user id was collected and executed by `batchLoad` function
at once.

Awesome right!

Thank to [dataloader](https://github.com/graphql/dataloader).

[project source](https://github.com/manh-vv/test-graphql)
