/**
 * User Profile Domain Types
 */

export interface UserDto {
  id: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  imageUrl?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  image?: File | FileUploadRequest;
  deleteCurrentImage: boolean;
}

export interface FileUploadRequest {
  fileName: string;
  contentType: string;
  data: number[];
}

export interface ChangePasswordRequest {
  password: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ProfileError {
  message: string;
  field?: string;
  details?: string;
}
