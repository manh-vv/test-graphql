import faker from 'faker';
import { sleep } from '../utils';

const createUser = id => ({
  id,
  name: faker.internet.userName(),
  star: faker.random.number({ max: 1000 }),
});

const findById = async id => {
  await sleep(200);
  console.log('User -- findById', id);

  return createUser(id);
}

const batchLoad = async ids => {
  await sleep(300);
  console.log('User -- batchLoad', ids);

  return ids.map(id => createUser(id));
}

export const userService = {
  findById,
  batchLoad,
}
