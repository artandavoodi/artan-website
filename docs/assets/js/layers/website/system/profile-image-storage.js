/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) IMPORTS
   03) CONSTANTS
   04) VALUE HELPERS
   05) STORAGE STATE
   06) UPLOAD API
   07) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/layers/website/system/profile-image-storage.js */

/* =============================================================================
   02) IMPORTS
============================================================================= */
import {
  getSupabaseClient,
  normalizeString
} from './account-profile-identity.js';

/* =============================================================================
   03) CONSTANTS
============================================================================= */
const PROFILE_MEDIA_BUCKET = 'profile-media';
const STORAGE_MODE = 'supabase_storage_pending_bucket_policy';

/* =============================================================================
   04) VALUE HELPERS
============================================================================= */
function normalizeStorageKind(kind = 'avatar') {
  const normalizedKind = normalizeString(kind || 'avatar').toLowerCase();
  return normalizedKind === 'cover' ? 'cover' : 'avatar';
}

function getUserId(user = {}) {
  return normalizeString(user.id || user.uid || '');
}

function isUploadableFile(file) {
  return typeof File !== 'undefined' && file instanceof File && file.size > 0;
}

function createSafeFileName(file) {
  const originalName = normalizeString(file?.name || 'profile-image');
  const normalizedName = originalName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalizedName || 'profile-image';
}

function createStoragePath({ file, user, kind }) {
  const userId = getUserId(user);
  const storageKind = normalizeStorageKind(kind);
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '');
  return `${userId}/profile/${storageKind}/${timestamp}-${createSafeFileName(file)}`;
}

/* =============================================================================
   05) STORAGE STATE
============================================================================= */
export function getProfileImageStorageState() {
  return {
    bucket: PROFILE_MEDIA_BUCKET,
    mode: STORAGE_MODE,
    supabaseConfigured: Boolean(getSupabaseClient())
  };
}

/* =============================================================================
   06) UPLOAD API
============================================================================= */
export async function uploadProfileImage({
  file = null,
  user = null,
  kind = 'avatar',
  supabase = getSupabaseClient()
} = {}) {
  if (!supabase) {
    const error = new Error('PROFILE_IMAGE_STORAGE_UNAVAILABLE');
    error.code = 'PROFILE_IMAGE_STORAGE_UNAVAILABLE';
    throw error;
  }

  if (!getUserId(user)) {
    const error = new Error('AUTH_REQUIRED');
    error.code = 'AUTH_REQUIRED';
    throw error;
  }

  if (!isUploadableFile(file)) {
    const error = new Error('PROFILE_IMAGE_FILE_REQUIRED');
    error.code = 'PROFILE_IMAGE_FILE_REQUIRED';
    throw error;
  }

  const storageKind = normalizeStorageKind(kind);
  const storagePath = createStoragePath({ file, user, kind: storageKind });
  const { data, error } = await supabase
    .storage
    .from(PROFILE_MEDIA_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'application/octet-stream'
    });

  if (error) {
    const uploadError = new Error(error.message || 'PROFILE_IMAGE_UPLOAD_FAILED');
    uploadError.code = error.code || 'PROFILE_IMAGE_UPLOAD_FAILED';
    uploadError.cause = error;
    throw uploadError;
  }

  const publicUrlResult = supabase
    .storage
    .from(PROFILE_MEDIA_BUCKET)
    .getPublicUrl(data?.path || storagePath);

  return {
    bucket: PROFILE_MEDIA_BUCKET,
    kind: storageKind,
    storagePath: data?.path || storagePath,
    publicUrl: publicUrlResult?.data?.publicUrl || '',
    mode: 'supabase_storage'
  };
}

/* =============================================================================
   07) END OF FILE
============================================================================= */
