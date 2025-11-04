import { appUserRepository } from '@repositories/appUser.repository';
import { AppError } from '@/utils/errors';
import { UpdateUserPreferencesDto } from '@/types/user.types';
import { imagesService } from '@services/images.service';

export class UserPreferencesService {
  async getPreferences(userId: string) {
    // Get user from internal database
    const user = await appUserRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Return preference fields
    return {
      id: user.id,
      displayName: user.displayName ?? undefined,
      username: user.username,
      email: user.email ?? undefined,
      country: user.country ?? undefined,
      stateProvince: user.stateProvince ?? undefined,
      city: user.city ?? undefined,
      description: user.description ?? undefined,
      profileImage: user.profileImage ?? undefined,
    };
  }

  async updatePreferences(userId: string, data: UpdateUserPreferencesDto) {
    // Update user in internal database
    const updated = await appUserRepository.update(userId, data);

    if (!updated) {
      throw new AppError('User not found', 404);
    }

    return {
      id: updated.id,
      displayName: updated.displayName ?? undefined,
      username: updated.username,
      email: updated.email ?? undefined,
      country: updated.country ?? undefined,
      stateProvince: updated.stateProvince ?? undefined,
      city: updated.city ?? undefined,
      description: updated.description ?? undefined,
      profileImage: updated.profileImage ?? undefined,
    };
  }

  async uploadAndSetProfileImage(userId: string, buffer: Buffer, originalMime?: string) {
    // Verify user exists
    const existing = await appUserRepository.findById(userId);
    if (!existing) {
      throw new AppError('User not found', 404);
    }

    // Upload image
    const saved = await imagesService.save(buffer, originalMime);

    // Update preferences with filename
    await this.updatePreferences(userId, { profileImage: saved.filename });

    return saved;
  }
}

export const userPreferencesService = new UserPreferencesService();