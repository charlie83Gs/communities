import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { OpenFGAService } from '@/services/openfga.service';

// Mock OpenFGA client
const mockOpenFgaClient = {
  createStore: mock(() => Promise.resolve({ id: 'store-123' })),
  writeAuthorizationModel: mock(() => Promise.resolve({ authorization_model_id: 'model-123' })),
  check: mock(() => Promise.resolve({ allowed: true })),
  read: mock(() => Promise.resolve({ tuples: [] })),
  write: mock(() => Promise.resolve({})),
  listObjects: mock(() => Promise.resolve({ objects: [] })),
};

describe('OpenFGAService', () => {
  let service: OpenFGAService;

  beforeEach(() => {
    // Reset all mocks
    Object.values(mockOpenFgaClient).forEach(m => m.mockReset());

    // Set default mock responses
    mockOpenFgaClient.check.mockResolvedValue({ allowed: true });
    mockOpenFgaClient.read.mockResolvedValue({ tuples: [] });
    mockOpenFgaClient.write.mockResolvedValue({});
    mockOpenFgaClient.listObjects.mockResolvedValue({ objects: [] });

    // Create service instance (note: we'd need to mock the constructor/client initialization in real tests)
    service = new OpenFGAService();
  });

  describe('can', () => {
    it('should check if user can perform action on resource', async () => {
      const service = new OpenFGAService();
      (service as any).initialized = true;
      (service as any).client = mockOpenFgaClient;

      mockOpenFgaClient.check.mockResolvedValueOnce({ allowed: false }).mockResolvedValueOnce({ allowed: true });

      const result = await service.can('user-123', 'communities', 'comm-123', 'read');

      expect(result).toBe(true);
      expect(mockOpenFgaClient.check).toHaveBeenCalled();
    });

    it('should return true for superadmin', async () => {
      const service = new OpenFGAService();
      (service as any).initialized = true;
      (service as any).client = mockOpenFgaClient;

      mockOpenFgaClient.check.mockResolvedValueOnce({ allowed: true });

      const result = await service.can('user-123', 'communities', 'comm-123', 'read');

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      const service = new OpenFGAService();
      (service as any).initialized = true;
      (service as any).client = mockOpenFgaClient;

      mockOpenFgaClient.check.mockRejectedValue(new Error('OpenFGA error'));

      const result = await service.can('user-123', 'communities', 'comm-123', 'read');

      expect(result).toBe(false);
    });
  });

  describe('getUserRoleForResource', () => {
    it('should return highest privilege role', async () => {
      const service = new OpenFGAService();
      (service as any).initialized = true;
      (service as any).client = mockOpenFgaClient;

      mockOpenFgaClient.check
        .mockResolvedValueOnce({ allowed: false })  // admin
        .mockResolvedValueOnce({ allowed: true });   // member

      const result = await service.getUserRoleForResource('user-123', 'communities', 'comm-123');

      expect(result).toBe('member');
    });

    it('should return null if no role found', async () => {
      const service = new OpenFGAService();
      (service as any).initialized = true;
      (service as any).client = mockOpenFgaClient;

      mockOpenFgaClient.check.mockResolvedValue({ allowed: false });

      const result = await service.getUserRoleForResource('user-123', 'communities', 'comm-123');

      expect(result).toBeNull();
    });
  });

  describe('getUserRolesForResource', () => {
    it('should return all roles for user', async () => {
      const service = new OpenFGAService();
      (service as any).initialized = true;
      (service as any).client = mockOpenFgaClient;

      mockOpenFgaClient.check
        .mockResolvedValueOnce({ allowed: true })   // admin
        .mockResolvedValueOnce({ allowed: true })   // member
        .mockResolvedValueOnce({ allowed: false }); // reader

      const result = await service.getUserRolesForResource('user-123', 'communities', 'comm-123');

      expect(result).toContain('admin');
      expect(result).toContain('member');
      expect(result).not.toContain('reader');
    });

    it('should return empty array if no roles', async () => {
      const service = new OpenFGAService();
      (service as any).initialized = true;
      (service as any).client = mockOpenFgaClient;

      mockOpenFgaClient.check.mockResolvedValue({ allowed: false });

      const result = await service.getUserRolesForResource('user-123', 'communities', 'comm-123');

      expect(result).toHaveLength(0);
    });
  });

  describe('assignRole', () => {
    it('should assign role to user', async () => {
      const service = new OpenFGAService();
      (service as any).initialized = true;
      (service as any).client = mockOpenFgaClient;

      // Mock reading existing tuples (none found)
      mockOpenFgaClient.read.mockResolvedValue({ tuples: [] });
      // Mock writing new tuple
      mockOpenFgaClient.write.mockResolvedValue({});
      // Mock final verification - getUserRolesForResource checks admin, member, reader in order
      mockOpenFgaClient.check.mockResolvedValueOnce({ allowed: false }); // admin
      mockOpenFgaClient.check.mockResolvedValueOnce({ allowed: true });  // member
      mockOpenFgaClient.check.mockResolvedValueOnce({ allowed: false }); // reader

      await service.assignRole('user-123', 'communities', 'comm-123', 'member');

      expect(mockOpenFgaClient.write).toHaveBeenCalled();
    });

    it('should be idempotent when role already exists', async () => {
      const service = new OpenFGAService();
      (service as any).initialized = true;
      (service as any).client = mockOpenFgaClient;

      // Mock existing tuple with the same role
      mockOpenFgaClient.read.mockResolvedValue({
        tuples: [{
          key: {
            user: 'user:user-123',
            relation: 'member',
            object: 'community:comm-123',
          },
        }],
      });
      // Mock final verification - getUserRolesForResource checks admin, member, reader in order
      mockOpenFgaClient.check.mockResolvedValueOnce({ allowed: false }); // admin
      mockOpenFgaClient.check.mockResolvedValueOnce({ allowed: true });  // member
      mockOpenFgaClient.check.mockResolvedValueOnce({ allowed: false }); // reader

      await service.assignRole('user-123', 'communities', 'comm-123', 'member');

      // Should not write since role already exists
      expect(mockOpenFgaClient.write).not.toHaveBeenCalled();
    });

    it('should throw error for invalid role', async () => {
      const service = new OpenFGAService();
      (service as any).initialized = true;
      (service as any).client = mockOpenFgaClient;

      await expect(
        service.assignRole('user-123', 'communities', 'comm-123', 'invalid')
      ).rejects.toThrow('Invalid role');
    });
  });

  describe('removeRole', () => {
    it('should remove all role tuples for user', async () => {
      const service = new OpenFGAService();
      (service as any).initialized = true;
      (service as any).client = mockOpenFgaClient;

      mockOpenFgaClient.write.mockResolvedValue({});

      await service.removeRole('user-123', 'communities', 'comm-123');

      expect(mockOpenFgaClient.write).toHaveBeenCalledWith({
        deletes: expect.arrayContaining([
          {
            user: 'user:user-123',
            relation: 'admin',
            object: 'community:comm-123',
          },
          {
            user: 'user:user-123',
            relation: 'member',
            object: 'community:comm-123',
          },
          {
            user: 'user:user-123',
            relation: 'reader',
            object: 'community:comm-123',
          },
        ]),
      });
    });
  });

  describe('createRelationship', () => {
    it('should create relationship between resources', async () => {
      const service = new OpenFGAService();
      (service as any).initialized = true;
      (service as any).client = mockOpenFgaClient;

      await service.createRelationship(
        'shares',
        'share-123',
        'parent_community',
        'communities',
        'comm-123'
      );

      expect(mockOpenFgaClient.write).toHaveBeenCalledWith({
        writes: [{
          user: 'community:comm-123',
          relation: 'parent_community',
          object: 'shares:share-123',
        }],
      });
    });
  });

  describe('setInviteRoleMetadata', () => {
    it('should set invite role metadata', async () => {
      const service = new OpenFGAService();
      (service as any).initialized = true;
      (service as any).client = mockOpenFgaClient;

      await service.setInviteRoleMetadata('invite-123', 'member');

      expect(mockOpenFgaClient.write).toHaveBeenCalledWith({
        writes: [{
          user: 'user:metadata',
          relation: 'grants_member',
          object: 'invite:invite-123',
        }],
      });
    });
  });

  describe('getInviteRoleMetadata', () => {
    it('should retrieve invite role metadata', async () => {
      const service = new OpenFGAService();
      (service as any).initialized = true;
      (service as any).client = mockOpenFgaClient;

      mockOpenFgaClient.check
        .mockResolvedValueOnce({ allowed: false })  // admin
        .mockResolvedValueOnce({ allowed: true });  // member

      const result = await service.getInviteRoleMetadata('invite-123');

      expect(result).toBe('member');
    });

    it('should return null if no metadata found', async () => {
      const service = new OpenFGAService();
      (service as any).initialized = true;
      (service as any).client = mockOpenFgaClient;

      mockOpenFgaClient.check.mockResolvedValue({ allowed: false });

      const result = await service.getInviteRoleMetadata('invite-123');

      expect(result).toBeNull();
    });
  });

  describe('batchWrite', () => {
    it('should write multiple tuples in batch', async () => {
      const service = new OpenFGAService();
      (service as any).initialized = true;
      (service as any).client = mockOpenFgaClient;

      const writes = [
        { user: 'user:user-123', relation: 'member', object: 'community:comm-123' },
      ];
      const deletes = [
        { user: 'user:user-456', relation: 'member', object: 'community:comm-123' },
      ];

      await service.batchWrite(writes, deletes);

      expect(mockOpenFgaClient.write).toHaveBeenCalledWith({ writes, deletes });
    });
  });

  describe('checkTrustLevel', () => {
    it('should return true for admin regardless of trust level', async () => {
      const service = new OpenFGAService();
      (service as any).initialized = true;
      (service as any).client = mockOpenFgaClient;

      mockOpenFgaClient.check.mockResolvedValueOnce({ allowed: true });

      const result = await service.checkTrustLevel('user-123', 'comm-123', 50);

      expect(result).toBe(true);
    });

    it('should check trust levels from threshold to 100', async () => {
      const service = new OpenFGAService();
      (service as any).initialized = true;
      (service as any).client = mockOpenFgaClient;

      mockOpenFgaClient.check
        .mockResolvedValueOnce({ allowed: false })  // admin check
        .mockResolvedValueOnce({ allowed: true });  // trust_level_50

      const result = await service.checkTrustLevel('user-123', 'comm-123', 50);

      expect(result).toBe(true);
    });

    it('should return false if no sufficient trust level', async () => {
      const service = new OpenFGAService();
      (service as any).initialized = true;
      (service as any).client = mockOpenFgaClient;

      mockOpenFgaClient.check.mockResolvedValue({ allowed: false });

      const result = await service.checkTrustLevel('user-123', 'comm-123', 50);

      expect(result).toBe(false);
    });
  });
});
