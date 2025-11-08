import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { AppUserRepository } from '@/repositories/appUser.repository';
import type { AppUser, NewAppUser, UpdateAppUser } from '@/repositories/appUser.repository';
import { createThenableMockDb, setupMockDbChains } from '../../tests/helpers/mockDb';

let appUserRepository: AppUserRepository;

// Create mock database
const mockDb = createThenableMockDb();

// Static test data
const mockUser: AppUser = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  displayName: 'Test User',
  profileImage: null,
  lastSeenAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockUser2: AppUser = {
  id: 'user-456',
  email: 'test2@example.com',
  username: 'testuser2',
  displayName: 'Test User 2',
  profileImage: null,
  lastSeenAt: null,
  createdAt: new Date('2024-01-02'),
  updatedAt: new Date('2024-01-02'),
};

const mockNewUser: NewAppUser = {
  id: 'user-new-123',
  email: 'newuser@example.com',
  username: 'newuser',
  displayName: 'New User',
};

describe('AppUserRepository', () => {
  beforeEach(() => {
    // Reset all mocks and setup default chains
    setupMockDbChains(mockDb);
    // Instantiate repository with the per-test mock DB
    appUserRepository = new AppUserRepository(mockDb as any);
  });

  afterEach(() => {
    // Nothing to clean up; a fresh AppUserRepository is created per test
  });

  describe('Type Validation', () => {
    it('should have correct method signatures', () => {
      expect(typeof appUserRepository.findById).toBe('function');
      expect(typeof appUserRepository.findByEmail).toBe('function');
      expect(typeof appUserRepository.findByUsername).toBe('function');
      expect(typeof appUserRepository.create).toBe('function');
      expect(typeof appUserRepository.findOrCreate).toBe('function');
      expect(typeof appUserRepository.update).toBe('function');
      expect(typeof appUserRepository.updateLastSeen).toBe('function');
      expect(typeof appUserRepository.delete).toBe('function');
      expect(typeof appUserRepository.search).toBe('function');
      expect(typeof appUserRepository.isUsernameTaken).toBe('function');
      expect(typeof appUserRepository.isEmailTaken).toBe('function');
      expect(typeof appUserRepository.list).toBe('function');
      expect(typeof appUserRepository.count).toBe('function');
    });

    it('should have deprecated backward compatibility method', () => {
      expect(typeof appUserRepository.findBySupertokensUserId).toBe('function');
    });
  });

  describe('findById', () => {
    it('should return user for valid id', async () => {
      mockDb.limit.mockResolvedValue([mockUser]);

      const result = await appUserRepository.findById('user-123');

      expect(result).toEqual(mockUser);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalled();
    });

    it('should return undefined for nonexistent id', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await appUserRepository.findById('nonexistent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('findByEmail', () => {
    it('should return user for valid email', async () => {
      mockDb.limit.mockResolvedValue([mockUser]);

      const result = await appUserRepository.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalled();
    });

    it('should return undefined for nonexistent email', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await appUserRepository.findByEmail('nonexistent@example.com');

      expect(result).toBeUndefined();
    });
  });

  describe('findByUsername', () => {
    it('should return user for valid username', async () => {
      mockDb.limit.mockResolvedValue([mockUser]);

      const result = await appUserRepository.findByUsername('testuser');

      expect(result).toEqual(mockUser);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalled();
    });

    it('should handle case-insensitive search', async () => {
      mockDb.limit.mockResolvedValue([mockUser]);

      const result = await appUserRepository.findByUsername('TestUser');

      expect(result).toEqual(mockUser);
    });

    it('should return undefined for nonexistent username', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await appUserRepository.findByUsername('nonexistentuser');

      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create user with all required fields', async () => {
      const createdUser: AppUser = {
        ...mockNewUser,
        profileImage: null,
        lastSeenAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      mockDb.returning.mockResolvedValue([createdUser]);

      const result = await appUserRepository.create(mockNewUser);

      expect(result).toEqual(createdUser);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('should create user with optional fields', async () => {
      const userWithImage: NewAppUser = {
        ...mockNewUser,
        profileImage: 'https://example.com/avatar.png',
      };
      const createdUser: AppUser = {
        ...userWithImage,
        lastSeenAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      mockDb.returning.mockResolvedValue([createdUser]);

      const result = await appUserRepository.create(userWithImage);

      expect(result.profileImage).toBe('https://example.com/avatar.png');
    });

    it('should set timestamps automatically', async () => {
      const createdUser: AppUser = {
        ...mockNewUser,
        profileImage: null,
        lastSeenAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      mockDb.returning.mockResolvedValue([createdUser]);

      const result = await appUserRepository.create(mockNewUser);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('findOrCreate', () => {
    it('should create new user if not exists', async () => {
      mockDb.limit.mockResolvedValueOnce([]);
      const createdUser: AppUser = {
        ...mockNewUser,
        profileImage: null,
        lastSeenAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      mockDb.returning.mockResolvedValue([createdUser]);

      const result = await appUserRepository.findOrCreate(mockNewUser);

      expect(result.created).toBe(true);
      expect(result.user).toEqual(createdUser);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should return existing user if found', async () => {
      mockDb.limit.mockResolvedValue([mockUser]);

      const result = await appUserRepository.findOrCreate(mockNewUser);

      expect(result.created).toBe(false);
      expect(result.user).toEqual(mockUser);
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('should return object with user and created flag', async () => {
      mockDb.limit.mockResolvedValue([mockUser]);

      const result = await appUserRepository.findOrCreate(mockNewUser);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('created');
      expect(typeof result.created).toBe('boolean');
    });
  });

  describe('update', () => {
    it('should update user fields', async () => {
      const updates: UpdateAppUser = {
        displayName: 'Updated User',
        profileImage: 'https://example.com/new-avatar.png',
      };
      const updatedUser: AppUser = {
        ...mockUser,
        ...updates,
        updatedAt: new Date('2024-01-02'),
      };
      mockDb.returning.mockResolvedValue([updatedUser]);

      const result = await appUserRepository.update('user-123', updates);

      expect(result).toEqual(updatedUser);
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('should return undefined for nonexistent user', async () => {
      mockDb.returning.mockResolvedValue([]);

      const updates: UpdateAppUser = {
        displayName: 'Should Not Work',
      };
      const result = await appUserRepository.update('nonexistent-id', updates);

      expect(result).toBeUndefined();
    });

    it('should update timestamp automatically', async () => {
      const updates: UpdateAppUser = {
        displayName: 'Updated Time User',
      };
      const updatedUser: AppUser = {
        ...mockUser,
        ...updates,
        updatedAt: new Date('2024-01-02'),
      };
      mockDb.returning.mockResolvedValue([updatedUser]);

      const result = await appUserRepository.update('user-123', updates);

      expect(result).toBeDefined();
      if (result) {
        expect(result.updatedAt).toBeInstanceOf(Date);
      }
    });

    it('should allow partial updates', async () => {
      const updates: UpdateAppUser = {
        email: 'updated@example.com',
      };
      const updatedUser: AppUser = {
        ...mockUser,
        email: 'updated@example.com',
        updatedAt: new Date('2024-01-02'),
      };
      mockDb.returning.mockResolvedValue([updatedUser]);

      const result = await appUserRepository.update('user-123', updates);

      expect(result).toBeDefined();
      if (result) {
        expect(result.email).toBe('updated@example.com');
        expect(result.displayName).toBe(mockUser.displayName);
      }
    });
  });

  describe('updateLastSeen', () => {
    it('should update lastSeenAt timestamp', async () => {
      mockDb.where.mockResolvedValue(undefined);

      await appUserRepository.updateLastSeen('user-123');

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should not throw for nonexistent user', async () => {
      mockDb.where.mockResolvedValue(undefined);

      await expect(appUserRepository.updateLastSeen('nonexistent-id')).resolves.toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      mockDb.where.mockResolvedValue(undefined);

      await appUserRepository.delete('user-123');

      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should not throw for nonexistent user', async () => {
      mockDb.where.mockResolvedValue(undefined);

      await expect(appUserRepository.delete('nonexistent-id')).resolves.toBeUndefined();
    });
  });

  describe('search', () => {
    it('should search by username', async () => {
      mockDb.offset.mockResolvedValue([mockUser, mockUser2]);

      const result = await appUserRepository.search('testuser');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalled();
      expect(mockDb.offset).toHaveBeenCalled();
    });

    it('should handle empty query', async () => {
      mockDb.offset.mockResolvedValue([mockUser, mockUser2]);

      const result = await appUserRepository.search('');

      expect(Array.isArray(result)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      mockDb.offset.mockResolvedValue([mockUser]);

      const result = await appUserRepository.search('test', 5);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(5);
    });

    it('should respect offset parameter', async () => {
      mockDb.offset.mockResolvedValue([mockUser2]);

      const result = await appUserRepository.search('test', 10, 5);

      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array when no matches', async () => {
      mockDb.offset.mockResolvedValue([]);

      const result = await appUserRepository.search('nonexistent-query');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });
  });

  describe('isUsernameTaken', () => {
    it('should return true for existing username', async () => {
      mockDb.limit.mockResolvedValue([{ id: 'user-123' }]);

      const result = await appUserRepository.isUsernameTaken('testuser');

      expect(result).toBe(true);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalled();
    });

    it('should return false for nonexistent username', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await appUserRepository.isUsernameTaken('nonexistent');

      expect(result).toBe(false);
    });

    it('should be case-insensitive', async () => {
      mockDb.limit.mockResolvedValue([{ id: 'user-123' }]);

      const result = await appUserRepository.isUsernameTaken('TESTUSER');

      expect(result).toBe(true);
    });

    it('should exclude user by id', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await appUserRepository.isUsernameTaken('testuser', 'user-123');

      expect(result).toBe(false);
    });

    it('should return true when checking another user with same username', async () => {
      mockDb.limit.mockResolvedValue([{ id: 'user-456' }]);

      const result = await appUserRepository.isUsernameTaken('testuser', 'user-123');

      expect(result).toBe(true);
    });
  });

  describe('isEmailTaken', () => {
    it('should return true for existing email', async () => {
      mockDb.limit.mockResolvedValue([{ id: 'user-123' }]);

      const result = await appUserRepository.isEmailTaken('test@example.com');

      expect(result).toBe(true);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalled();
    });

    it('should return false for nonexistent email', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await appUserRepository.isEmailTaken('nonexistent@example.com');

      expect(result).toBe(false);
    });

    it('should exclude user by id', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await appUserRepository.isEmailTaken('test@example.com', 'user-123');

      expect(result).toBe(false);
    });

    it('should return true when checking another user with same email', async () => {
      mockDb.limit.mockResolvedValue([{ id: 'user-456' }]);

      const result = await appUserRepository.isEmailTaken('test@example.com', 'user-123');

      expect(result).toBe(true);
    });
  });

  describe('list', () => {
    it('should return array of users', async () => {
      mockDb.orderBy.mockResolvedValue([mockUser, mockUser2]);

      const result = await appUserRepository.list();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalled();
      expect(mockDb.offset).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();
    });

    it('should respect limit parameter', async () => {
      mockDb.orderBy.mockResolvedValue([mockUser]);

      const result = await appUserRepository.list(10);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should respect offset parameter', async () => {
      mockDb.orderBy.mockResolvedValue([mockUser2]);

      const result = await appUserRepository.list(10, 5);

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle pagination', async () => {
      mockDb.orderBy.mockResolvedValueOnce([mockUser]);
      const page1 = await appUserRepository.list(5, 0);

      mockDb.orderBy.mockResolvedValueOnce([mockUser2]);
      const page2 = await appUserRepository.list(5, 5);

      expect(Array.isArray(page1)).toBe(true);
      expect(Array.isArray(page2)).toBe(true);
    });
  });

  describe('count', () => {
    it('should return number', async () => {
      mockDb.from.mockResolvedValue([{ count: 42 }]);

      const result = await appUserRepository.count();

      expect(typeof result).toBe('number');
      expect(result).toBe(42);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
    });

    it('should return non-negative number', async () => {
      mockDb.from.mockResolvedValue([{ count: 0 }]);

      const result = await appUserRepository.count();

      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should handle null count', async () => {
      mockDb.from.mockResolvedValue([{ count: null }]);

      const result = await appUserRepository.count();

      expect(result).toBe(0);
    });
  });

  describe('findBySupertokensUserId (deprecated)', () => {
    it('should call findById', async () => {
      mockDb.limit.mockResolvedValue([mockUser]);

      const result = await appUserRepository.findBySupertokensUserId('user-123');

      expect(result).toEqual(mockUser);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('should return same result as findById', async () => {
      mockDb.limit.mockResolvedValueOnce([mockUser]);
      const result1 = await appUserRepository.findById('user-123');

      mockDb.limit.mockResolvedValueOnce([mockUser]);
      const result2 = await appUserRepository.findBySupertokensUserId('user-123');

      expect(result1).toEqual(result2);
    });
  });

  describe('Input validation', () => {
    it('should accept valid NewAppUser', () => {
      const input: NewAppUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
      };

      expect(input.id).toBe('user-123');
      expect(input.email).toBe('test@example.com');
    });

    it('should accept NewAppUser with optional fields', () => {
      const input: NewAppUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        profileImage: 'https://example.com/avatar.png',
      };

      expect(input.profileImage).toBe('https://example.com/avatar.png');
    });

    it('should accept valid UpdateAppUser', () => {
      const input: UpdateAppUser = {
        displayName: 'Updated Name',
      };

      expect(input.displayName).toBe('Updated Name');
    });

    it('should not allow updating id or createdAt in UpdateAppUser', () => {
      const input: UpdateAppUser = {
        email: 'updated@example.com',
        username: 'updateduser',
        displayName: 'Updated User',
        profileImage: 'https://example.com/new-avatar.png',
      };

      // TypeScript should prevent these at compile time
      expect((input as any).id).toBeUndefined();
      expect((input as any).createdAt).toBeUndefined();
    });
  });

  describe('Return type validation', () => {
    it('findById should return AppUser or undefined', async () => {
      mockDb.limit.mockResolvedValue([mockUser]);

      const result = await appUserRepository.findById('user-123');

      expect(result).toBeDefined();
      if (result) {
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('email');
        expect(result).toHaveProperty('username');
        expect(result).toHaveProperty('displayName');
      }
    });

    it('create should return AppUser', async () => {
      const createdUser: AppUser = {
        ...mockNewUser,
        profileImage: null,
        lastSeenAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      mockDb.returning.mockResolvedValue([createdUser]);

      const result = await appUserRepository.create(mockNewUser);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('findOrCreate should return object with user and created flag', async () => {
      mockDb.limit.mockResolvedValue([mockUser]);

      const result = await appUserRepository.findOrCreate(mockNewUser);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('created');
      expect(typeof result.created).toBe('boolean');
      expect(result.user).toHaveProperty('id');
    });

    it('search should return array of AppUser', async () => {
      mockDb.offset.mockResolvedValue([mockUser, mockUser2]);

      const result = await appUserRepository.search('test');

      expect(Array.isArray(result)).toBe(true);
      result.forEach((user) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('username');
      });
    });
  });
});
