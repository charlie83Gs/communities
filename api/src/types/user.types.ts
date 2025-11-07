export interface UpdateUserPreferencesDto {
  displayName?: string;
  description?: string;
  profileImage?: string;
}

export interface UserPreferencesResponse {
  displayName?: string;
  description?: string;
  profileImage?: string;
}
