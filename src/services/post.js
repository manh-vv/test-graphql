import faker from 'faker';
import { sleep } from '../utils';

const createPost = id => ({
  id,
  title: faker.name.jobTitle(),
  content: faker.lorem.paragraph(),
  creator: faker.random.uuid(),
});

const find = async () => {
  await sleep(150);
  console.log('Post -- find');

  return new Array(5).fill().map(() => createPost(faker.random.uuid()));
}

export const postService = {
  find,
};
