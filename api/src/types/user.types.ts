export interface UpdateUserPreferencesDto {
  displayName?: string;
  country?: string;
  stateProvince?: string;
  city?: string;
  description?: string;
  profileImage?: string;
}

export interface UserPreferencesResponse {
  displayName?: string;
  country?: string;
  stateProvince?: string;
  city?: string;
  description?: string;
  profileImage?: string;
}