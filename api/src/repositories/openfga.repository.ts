import { OpenFgaClient } from '@openfga/sdk';

/**
 * OpenFGA Repository
 *
 * Thin data access layer for OpenFGA operations.
 * This repository wraps the OpenFGA SDK client for tuple operations.
 *
 * Initialization is handled separately by the OpenFGA service/utility.
 */
export class OpenFGARepository {
  private client: OpenFgaClient;

  constructor(client: OpenFgaClient) {
    this.client = client;
  }

  /**
   * Check if user can perform action on resource
   */
  async check(params: { user: string; relation: string; object: string }): Promise<boolean> {
    try {
      const response = await this.client.check(params);
      return response.allowed || false;
    } catch (error) {
      console.error('[OpenFGA Repository] Check error:', error);
      return false;
    }
  }

  /**
   * Read tuples matching a pattern
   *
   * IMPORTANT: Pass pattern directly - SDK expects { user?, relation?, object? }
   * NOT wrapped in tuple_key (that's the REST API format, SDK abstracts it)
   */
  async readTuples(pattern: {
    user?: string;
    relation?: string;
    object?: string;
  }): Promise<Array<{ key: { user?: string; relation: string; object: string } }>> {
    try {
      const response = await this.client.read(pattern);
      return response.tuples || [];
    } catch (error) {
      console.error('[OpenFGA Repository] Read tuples error:', error);
      return [];
    }
  }

  /**
   * Write tuples to OpenFGA
   */
  async write(
    writes?: Array<{ user: string; relation: string; object: string }>,
    deletes?: Array<{ user: string; relation: string; object: string }>
  ): Promise<void> {
    try {
      await this.client.write({ writes, deletes });
    } catch (error) {
      console.error('[OpenFGA Repository] Write error:', error);
      throw error;
    }
  }

  /**
   * List objects user has access to
   */
  async listObjects(params: { user: string; relation: string; type: string }): Promise<string[]> {
    try {
      const response = await this.client.listObjects(params);

      // Extract IDs from the object references (format: "type:id")
      return (
        response.objects?.map((obj) => {
          const parts = obj.split(':');
          return parts.length > 1 ? parts.slice(1).join(':') : obj;
        }) || []
      );
    } catch (error) {
      console.error('[OpenFGA Repository] List objects error:', error);
      return [];
    }
  }
}
