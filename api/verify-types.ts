import { shareRequests } from './src/db/schema/shares.schema';

type ShareRequestRecord = typeof shareRequests.$inferSelect;

const example: ShareRequestRecord = {
  id: '123',
  shareId: '456', // TypeScript field name
  requesterId: '789',
  message: null,
  unitsRequested: null,
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
};

console.log('shareId field exists:', 'shareId' in example);
console.log('Keys:', Object.keys(example));
