import {
  valueCategoryRepository,
  CreateValueCategoryDto,
  UpdateValueCategoryDto,
} from '../repositories/valueCategory.repository';
import { communityRepository } from '../repositories/community.repository';
import {
  valueCalibrationRepository,
  CreateValueCalibrationDto,
} from '../repositories/valueCalibration.repository';
import { openfgaService } from './openfga.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

class ValueCategoryService {
  async createCategory(data: CreateValueCategoryDto, userId: string) {
    // 1. Verify community exists
    const community = await communityRepository.findById(data.communityId);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // 2. Check permission to manage recognition system
    const canManage = await openfgaService.checkAccess(
      userId,
      'community',
      data.communityId,
      'can_manage_recognition'
    );

    if (!canManage) {
      throw new AppError('You do not have permission to manage value categories', 403);
    }

    // 3. Check if category name already exists
    const existing = await valueCategoryRepository.findByCommunityAndName(
      data.communityId,
      data.categoryName
    );

    if (existing) {
      throw new AppError('A category with this name already exists', 409);
    }

    // 4. Create category
    const category = await valueCategoryRepository.create({
      ...data,
      proposedBy: userId,
    });

    logger.info('Value category created', {
      categoryId: category.id,
      communityId: data.communityId,
      createdBy: userId,
    });

    return category;
  }

  async getCategoriesByCommunity(communityId: string, userId: string, includeInactive = false) {
    // 1. Verify community exists
    const community = await communityRepository.findById(communityId);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // 2. Check permission to view recognition
    const canView = await openfgaService.checkAccess(
      userId,
      'community',
      communityId,
      'can_view_contributions'
    );

    if (!canView) {
      throw new AppError('You do not have permission to view value categories', 403);
    }

    // 3. Get categories
    return await valueCategoryRepository.findByCommunityId(communityId, includeInactive);
  }

  async getCategoryById(categoryId: string, userId: string) {
    // 1. Get category
    const category = await valueCategoryRepository.findById(categoryId);
    if (!category) {
      throw new AppError('Value category not found', 404);
    }

    // 2. Check permission
    const canView = await openfgaService.checkAccess(
      userId,
      'community',
      category.communityId,
      'can_view_contributions'
    );

    if (!canView) {
      throw new AppError('You do not have permission to view this category', 403);
    }

    return category;
  }

  async updateCategory(categoryId: string, data: UpdateValueCategoryDto, userId: string) {
    // 1. Get category
    const category = await valueCategoryRepository.findById(categoryId);
    if (!category) {
      throw new AppError('Value category not found', 404);
    }

    // 2. Check permission
    const canManage = await openfgaService.checkAccess(
      userId,
      'community',
      category.communityId,
      'can_manage_recognition'
    );

    if (!canManage) {
      throw new AppError('You do not have permission to update value categories', 403);
    }

    // 3. If changing category name, check for duplicates
    if (data.categoryName && data.categoryName !== category.categoryName) {
      const existing = await valueCategoryRepository.findByCommunityAndName(
        category.communityId,
        data.categoryName
      );

      if (existing) {
        throw new AppError('A category with this name already exists', 409);
      }
    }

    // 4. Update category
    const updated = await valueCategoryRepository.update(categoryId, data);

    logger.info('Value category updated', {
      categoryId,
      communityId: category.communityId,
      updatedBy: userId,
    });

    return updated;
  }

  async updateCategoryValue(
    categoryId: string,
    newValuePerUnit: string,
    reason: string,
    decidedThrough: 'council' | 'community_poll' | 'consensus',
    userId: string
  ) {
    // 1. Get category
    const category = await valueCategoryRepository.findById(categoryId);
    if (!category) {
      throw new AppError('Value category not found', 404);
    }

    // 2. Check permission
    const canManage = await openfgaService.checkAccess(
      userId,
      'community',
      category.communityId,
      'can_manage_recognition'
    );

    if (!canManage) {
      throw new AppError('You do not have permission to adjust value calibration', 403);
    }

    // 3. Validate new value
    const newValue = parseFloat(newValuePerUnit);
    if (isNaN(newValue) || newValue <= 0) {
      throw new AppError('Value per unit must be a positive number', 400);
    }

    // 4. Record calibration history
    const oldValuePerUnit = category.valuePerUnit;

    await valueCalibrationRepository.create({
      communityId: category.communityId,
      categoryId,
      oldValuePerUnit,
      newValuePerUnit,
      reason,
      proposedBy: userId,
      decidedThrough,
      effectiveDate: new Date(),
    });

    // 5. Update category
    const updated = await valueCategoryRepository.update(categoryId, {
      valuePerUnit: newValuePerUnit,
      lastReviewedAt: new Date(),
    });

    logger.info('Value category calibration updated', {
      categoryId,
      oldValue: oldValuePerUnit,
      newValue: newValuePerUnit,
      communityId: category.communityId,
      updatedBy: userId,
    });

    return updated;
  }

  async deleteCategory(categoryId: string, userId: string) {
    // 1. Get category
    const category = await valueCategoryRepository.findById(categoryId);
    if (!category) {
      throw new AppError('Value category not found', 404);
    }

    // 2. Check permission
    const canManage = await openfgaService.checkAccess(
      userId,
      'community',
      category.communityId,
      'can_manage_recognition'
    );

    if (!canManage) {
      throw new AppError('You do not have permission to delete value categories', 403);
    }

    // 3. Soft delete category
    await valueCategoryRepository.delete(categoryId);

    logger.info('Value category deleted', {
      categoryId,
      communityId: category.communityId,
      deletedBy: userId,
    });
  }

  async initializeDefaultCategories(communityId: string, userId: string) {
    // 1. Verify community exists
    const community = await communityRepository.findById(communityId);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // 2. Check permission (only admins should call this)
    const canManage = await openfgaService.checkAccess(
      userId,
      'community',
      communityId,
      'can_manage_recognition'
    );

    if (!canManage) {
      throw new AppError('You do not have permission to initialize categories', 403);
    }

    // 3. Check if categories already exist
    const existing = await valueCategoryRepository.findByCommunityId(communityId);
    if (existing.length > 0) {
      throw new AppError('Community already has value categories', 409);
    }

    // 4. Create default categories
    const categories = await valueCategoryRepository.createDefaultCategories(communityId, userId);

    logger.info('Default value categories initialized', {
      communityId,
      count: categories.length,
      initializedBy: userId,
    });

    return categories;
  }

  async getCalibrationHistory(categoryId: string, userId: string) {
    // 1. Get category
    const category = await valueCategoryRepository.findById(categoryId);
    if (!category) {
      throw new AppError('Value category not found', 404);
    }

    // 2. Check permission
    const canView = await openfgaService.checkAccess(
      userId,
      'community',
      category.communityId,
      'can_view_contributions'
    );

    if (!canView) {
      throw new AppError('You do not have permission to view calibration history', 403);
    }

    // 3. Get history
    return await valueCalibrationRepository.findByCategory(categoryId);
  }
}

export const valueCategoryService = new ValueCategoryService();
