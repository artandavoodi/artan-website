/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) IMPORTS
   03) CONSTANTS
   04) BACKEND HELPERS
   05) AUTHOR HELPERS
   06) POST READ HELPERS
   07) POST WRITE HELPERS
   08) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/layers/website/system/feed-store.js */

/* =============================================================================
   02) IMPORTS
============================================================================= */
import {
  getSupabaseClient,
  getSupabaseProfileByAuthUserId,
  normalizeString,
  normalizeUsername,
} from './account-profile-identity.js';

/* =============================================================================
   03) CONSTANTS
============================================================================= */
const FEED_POSTS_TABLE = 'feed_posts';

const FEED_POST_SELECT_FIELDS = [
  'id',
  'profile_id',
  'owner_auth_user_id',
  'author_username',
  'author_display_name',
  'author_avatar_url',
  'post_body',
  'post_state',
  'visibility_state',
  'source_surface',
  'created_at',
  'updated_at',
].join(', ');

/* =============================================================================
   04) BACKEND HELPERS
============================================================================= */
export function getFeedStoreBackendState() {
  return {
    supabaseConfigured: Boolean(getSupabaseClient()),
    feedPostsTable: FEED_POSTS_TABLE,
    migrationStatus: 'supabase_canonical_feed_posts',
  };
}

function isSupabaseRelationMissingError(error) {
  const code = normalizeString(error?.code || '').toUpperCase();
  const message = normalizeString(error?.message || '').toLowerCase();
  return code === '42P01' || message.includes('does not exist');
}

async function getCurrentSupabaseUser() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;

  return data?.session?.user || null;
}

function getUserId(user) {
  return normalizeString(user?.id || user?.uid || '');
}

function mapFeedPost(row = {}, currentUserId = '') {
  if (!row || typeof row !== 'object') return null;

  const ownerAuthUserId = normalizeString(row.owner_auth_user_id || '');
  const displayName = normalizeString(row.author_display_name || row.author_username || 'Neuroartan profile');
  const username = normalizeUsername(row.author_username || '');

  return {
    id: normalizeString(row.id),
    feedPostId: normalizeString(row.id),
    profileId: normalizeString(row.profile_id || ''),
    ownerAuthUserId,
    ownedByCurrentUser: Boolean(currentUserId && ownerAuthUserId === currentUserId),
    entityType: 'Profile',
    entityLabel: displayName,
    username,
    avatar: normalizeString(row.author_avatar_url || ''),
    verified: false,
    content: normalizeString(row.post_body || ''),
    metadata: [
      'Profile post',
      row.created_at ? new Date(row.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '',
    ].filter(Boolean),
    tags: [],
    href: username ? `/${username}` : '/profile.html',
    publicRoute: username ? `/${username}` : '/profile.html',
    source: 'supabase-feed-post',
    createdAt: row.created_at || '',
  };
}

/* =============================================================================
   05) AUTHOR HELPERS
============================================================================= */
export async function getCurrentFeedAuthor() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      user: null,
      profile: null,
      backendState: getFeedStoreBackendState(),
    };
  }

  const user = await getCurrentSupabaseUser();
  const userId = getUserId(user);
  if (!userId) {
    return {
      user: null,
      profile: null,
      backendState: getFeedStoreBackendState(),
    };
  }

  const profile = await getSupabaseProfileByAuthUserId({
    supabase,
    authUserId: userId,
  });

  return {
    user,
    profile,
    backendState: getFeedStoreBackendState(),
  };
}

/* =============================================================================
   06) POST READ HELPERS
============================================================================= */
export async function getFeedPostById(feedPostId) {
  const supabase = getSupabaseClient();
  const normalizedId = normalizeString(feedPostId);
  if (!supabase || !normalizedId) return null;

  const user = await getCurrentSupabaseUser();
  const currentUserId = getUserId(user);

  const { data, error } = await supabase
    .from(FEED_POSTS_TABLE)
    .select(FEED_POST_SELECT_FIELDS)
    .eq('id', normalizedId)
    .maybeSingle();

  if (error) {
    if (isSupabaseRelationMissingError(error)) return null;
    throw error;
  }

  return data ? mapFeedPost(data, currentUserId) : null;
}

export async function listFeedPosts() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const user = await getCurrentSupabaseUser();
  const currentUserId = getUserId(user);

  const { data, error } = await supabase
    .from(FEED_POSTS_TABLE)
    .select(FEED_POST_SELECT_FIELDS)
    .eq('post_state', 'published')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    if (isSupabaseRelationMissingError(error)) return [];
    throw error;
  }

  return Array.isArray(data)
    ? data.map((row) => mapFeedPost(row, currentUserId)).filter(Boolean)
    : [];
}

/* =============================================================================
   07) POST WRITE HELPERS
============================================================================= */
export async function createFeedPost(values = {}) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    const error = new Error('FEED_BACKEND_UNAVAILABLE');
    error.code = 'FEED_BACKEND_UNAVAILABLE';
    throw error;
  }

  const { user, profile } = await getCurrentFeedAuthor();
  const ownerAuthUserId = getUserId(user);
  if (!ownerAuthUserId) {
    const error = new Error('AUTH_REQUIRED');
    error.code = 'AUTH_REQUIRED';
    throw error;
  }

  if (!profile?.id) {
    const error = new Error('PROFILE_REQUIRED');
    error.code = 'PROFILE_REQUIRED';
    throw error;
  }

  const postBody = normalizeString(values.post_body || values.body || '');
  if (!postBody) {
    const error = new Error('POST_BODY_REQUIRED');
    error.code = 'POST_BODY_REQUIRED';
    throw error;
  }

  const payload = {
    profile_id: profile.id,
    owner_auth_user_id: ownerAuthUserId,
    author_username: normalizeUsername(profile.username || profile.username_lower || profile.public_username || ''),
    author_display_name: normalizeString(profile.public_display_name || profile.display_name || user.user_metadata?.name || 'Neuroartan profile'),
    author_avatar_url: normalizeString(profile.public_avatar_url || profile.avatar_url || profile.photo_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || ''),
    post_body: postBody,
    post_state: 'published',
    visibility_state: 'public',
    source_surface: normalizeString(values.source_surface || 'feed'),
  };

  const { data, error } = await supabase
    .from(FEED_POSTS_TABLE)
    .insert(payload)
    .select(FEED_POST_SELECT_FIELDS)
    .single();

  if (error) throw error;

  return mapFeedPost(data, ownerAuthUserId);
}

export async function deleteFeedPost(feedPostId) {
  const supabase = getSupabaseClient();
  const normalizedId = normalizeString(feedPostId);
  if (!supabase || !normalizedId) return false;

  const user = await getCurrentSupabaseUser();
  const currentUserId = getUserId(user);
  if (!currentUserId) {
    const error = new Error('AUTH_REQUIRED');
    error.code = 'AUTH_REQUIRED';
    throw error;
  }

  const existingPost = await getFeedPostById(normalizedId);
  if (!existingPost) {
    return false;
  }

  if (!existingPost.ownedByCurrentUser) {
    const error = new Error('POST_DELETE_FORBIDDEN');
    error.code = 'POST_DELETE_FORBIDDEN';
    throw error;
  }

  const { error } = await supabase
    .from(FEED_POSTS_TABLE)
    .delete()
    .eq('id', normalizedId)
    .eq('owner_auth_user_id', currentUserId);

  if (error) throw error;
  return true;
}

/* =============================================================================
   08) END OF FILE
============================================================================= */
