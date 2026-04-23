/* =============================================================================
   00) FILE INDEX
   01) MODULE IMPORTS
   02) MODULE STATE
   03) CONSTANTS
   04) SUPABASE HELPERS
   05) FIREBASE HELPERS
   06) STATE STORE
   07) VALUE HELPERS
   08) ERROR HELPERS
   09) SAVE EXECUTION
   10) EVENT BINDING
   11) INITIALIZATION
   12) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IMPORTS
============================================================================= */
import {
  buildProfilePayload,
  evaluateEligibility,
  getProfileByUid,
  getSupabaseClient as getProfileIdentitySupabaseClient,
  loadProfileIdentityPolicy,
  normalizeEmail,
  normalizeString,
  normalizeUsername,
  reserveUsernameProfile
} from './account-profile-identity.js';

/* =============================================================================
   02) MODULE STATE
============================================================================= */
const RUNTIME = (window.__NEUROARTAN_PROFILE_SAVE__ ||= {
  initialized: false,
  state: null,
  subscribers: new Set()
});

/* =============================================================================
   03) CONSTANTS
============================================================================= */
const PROFILE_COLLECTION = 'profiles';
const USERNAME_RESERVATION_COLLECTION = 'username_reservations';
const SUPABASE_PROFILE_SELECT_FIELDS = 'id, auth_user_id, username, display_name, avatar_url, bio, visibility_state, profile_status, public_profile_enabled, public_profile_discoverable, public_display_name, public_identity_label, public_summary, public_primary_link, email, first_name, last_name, date_of_birth, birth_date, gender, username_lower, username_normalized';
const SAVE_SCOPES = Object.freeze(['identity', 'route', 'visibility']);

/* =============================================================================
   04) SUPABASE HELPERS
============================================================================= */
function getSupabaseClient() {
  return getProfileIdentitySupabaseClient();
}

function hasSupabaseClient() {
  return !!getSupabaseClient();
}

/* =============================================================================
   05) FIREBASE HELPERS
============================================================================= */
function hasFirebaseAuth() {
  return !!(window.firebase && typeof window.firebase.auth === 'function');
}

function hasFirestore() {
  return !!(window.firebase && typeof window.firebase.firestore === 'function');
}

function getFirebaseAuth() {
  if (!hasFirebaseAuth()) return null;

  try {
    return window.firebase.auth();
  } catch (_) {
    return null;
  }
}

function getFirestore() {
  if (!hasFirestore()) return null;

  try {
    return window.firebase.firestore();
  } catch (_) {
    return null;
  }
}

async function waitForFirebaseReady(timeoutMs = 15000) {
  if (hasFirebaseAuth() && hasFirestore()) return true;

  return new Promise((resolve) => {
    let settled = false;

    const finish = (value) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      document.removeEventListener('neuroartan:firebase-ready', handleReady);
      resolve(value);
    };

    const handleReady = () => {
      finish(hasFirebaseAuth() && hasFirestore());
    };

    const timeoutId = window.setTimeout(() => {
      finish(false);
    }, timeoutMs);

    document.addEventListener('neuroartan:firebase-ready', handleReady);
  });
}

/* =============================================================================
   06) STATE STORE
============================================================================= */
function createScopeState() {
  return {
    status: 'idle',
    code: '',
    message: ''
  };
}

function createDefaultState() {
  return {
    identity: createScopeState(),
    route: createScopeState(),
    visibility: createScopeState()
  };
}

function notifySubscribers() {
  RUNTIME.subscribers.forEach((subscriber) => {
    try {
      subscriber(getPrivateProfileSaveState());
    } catch (error) {
      console.error('[profile-save] Subscriber update failed.', error);
    }
  });
}

function setScopeState(scope, patch = {}) {
  const currentState = getPrivateProfileSaveState();
  RUNTIME.state = {
    ...currentState,
    [scope]: {
      ...currentState[scope],
      ...patch
    }
  };

  document.dispatchEvent(new CustomEvent('profile:private-save-state-changed', {
    detail: getPrivateProfileSaveState()
  }));

  notifySubscribers();
}

export function getPrivateProfileSaveState() {
  return RUNTIME.state || createDefaultState();
}

export function subscribePrivateProfileSaveState(subscriber) {
  if (typeof subscriber !== 'function') {
    return () => {};
  }

  RUNTIME.subscribers.add(subscriber);
  subscriber(getPrivateProfileSaveState());

  return () => {
    RUNTIME.subscribers.delete(subscriber);
  };
}

/* =============================================================================
   07) VALUE HELPERS
============================================================================= */
function getExistingProfileSeed(existingProfile = null, user = null) {
  return {
    email: normalizeEmail(existingProfile?.email || user?.email || ''),
    first_name: normalizeString(existingProfile?.first_name || ''),
    last_name: normalizeString(existingProfile?.last_name || ''),
    display_name: normalizeString(existingProfile?.display_name || user?.displayName || ''),
    date_of_birth: normalizeString(existingProfile?.date_of_birth || existingProfile?.birth_date || ''),
    gender: normalizeString(existingProfile?.gender || ''),
    username: normalizeString(existingProfile?.username || existingProfile?.username_normalized || existingProfile?.username_lower || ''),
    public_display_name: normalizeString(existingProfile?.public_display_name || existingProfile?.display_name || user?.displayName || ''),
    public_identity_label: normalizeString(existingProfile?.public_identity_label || ''),
    public_summary: normalizeString(existingProfile?.public_summary || ''),
    public_primary_link: normalizeString(existingProfile?.public_primary_link || ''),
    public_profile_enabled: existingProfile?.public_profile_enabled === true,
    public_profile_discoverable: existingProfile?.public_profile_discoverable === true
  };
}

function readCheckboxValue(formData, name) {
  return formData.get(name) === 'on';
}

function buildScopedValues(scope, form, existingProfile = null, user = null) {
  const seed = getExistingProfileSeed(existingProfile, user);
  const formData = new FormData(form);

  switch (scope) {
    case 'identity':
      return {
        ...seed,
        first_name: normalizeString(formData.get('first_name') || ''),
        last_name: normalizeString(formData.get('last_name') || ''),
        display_name: normalizeString(formData.get('display_name') || ''),
        date_of_birth: normalizeString(formData.get('date_of_birth') || ''),
        gender: normalizeString(formData.get('gender') || '')
      };
    case 'route':
      return {
        ...seed,
        username: normalizeString(formData.get('username') || seed.username || ''),
        public_display_name: normalizeString(formData.get('public_display_name') || ''),
        public_identity_label: normalizeString(formData.get('public_identity_label') || ''),
        public_summary: normalizeString(formData.get('public_summary') || ''),
        public_primary_link: normalizeString(formData.get('public_primary_link') || '')
      };
    case 'visibility':
      return {
        ...seed,
        public_profile_enabled: readCheckboxValue(formData, 'public_profile_enabled'),
        public_profile_discoverable: readCheckboxValue(formData, 'public_profile_discoverable')
      };
    default:
      return seed;
  }
}

/* =============================================================================
   08) ERROR HELPERS
============================================================================= */
function resolveProfileSaveErrorCode(error) {
  const code = normalizeString(error?.code || '');
  const message = normalizeString(error?.message || '').toLowerCase();

  if (code) return code;
  if (message.includes('api_key_http_referrer_blocked')) return 'API_KEY_HTTP_REFERRER_BLOCKED';
  if (message.includes('http referrer')) return 'API_KEY_HTTP_REFERRER_BLOCKED';
  if (message.includes('cloud firestore api has not been used')) return 'FIRESTORE_API_DISABLED';
  if (message.includes('client is offline')) return 'PROFILE_STORE_UNAVAILABLE';
  if (message.includes('could not reach cloud firestore backend')) return 'PROFILE_STORE_UNAVAILABLE';
  if (message.includes('row-level security')) return 'PROFILE_SAVE_BLOCKED';
  if (message.includes('jwt')) return 'AUTH_REQUIRED';
  return 'PROFILE_SAVE_FAILED';
}

function messageForProfileSaveError(code) {
  switch (code) {
    case 'FIREBASE_NOT_READY':
    case 'PROFILE_STORE_UNAVAILABLE':
      return 'Profile storage is not available right now.';
    case 'PROFILE_SAVE_BLOCKED':
      return 'Profile save is blocked by backend access policy right now.';
    case 'API_KEY_HTTP_REFERRER_BLOCKED':
      return 'Profile runtime is blocked by Firebase referrer restrictions for this origin.';
    case 'FIRESTORE_API_DISABLED':
      return 'Profile runtime is blocked because the Firestore API is not enabled for the active Firebase project.';
    case 'USERNAME_CHANGE_LOCKED':
      return 'Username changes are locked once a canonical handle has been claimed.';
    case 'USERNAME_TAKEN':
      return 'That username is already reserved by another profile.';
    case 'USERNAME_REQUIRED':
      return 'Choose a username before enabling the public route.';
    case 'INVALID_DATE_OF_BIRTH':
      return 'Enter a valid date of birth.';
    case 'USER_INELIGIBLE':
      return 'The supplied date of birth does not meet the current eligibility requirement.';
    case 'AUTH_REQUIRED':
      return 'Sign in before editing the private profile surface.';
    default:
      return 'Profile settings could not be saved right now.';
  }
}

/* =============================================================================
   09) SAVE EXECUTION
============================================================================= */
async function getSupabaseProfileByAuthUserId(supabase, authUserId) {
  if (!supabase || !authUserId) return null;

  const { data, error } = await supabase
    .from(PROFILE_COLLECTION)
    .select(SUPABASE_PROFILE_SELECT_FIELDS)
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

async function persistProfileWithSupabase(scope, values, existingProfile, user, policy, supabase) {
  const normalizedUsername = normalizeUsername(values.username || existingProfile?.username || '');

  if (scope === 'visibility' && values.public_profile_enabled && !normalizedUsername) {
    const error = new Error('USERNAME_REQUIRED');
    error.code = 'USERNAME_REQUIRED';
    throw error;
  }

  if (values.date_of_birth) {
    const eligibility = evaluateEligibility(values.date_of_birth, policy);
    if (!eligibility.eligible) {
      const error = new Error(eligibility.reason || 'INVALID_DATE_OF_BIRTH');
      error.code = eligibility.reason || 'INVALID_DATE_OF_BIRTH';
      throw error;
    }

    values.eligibility_age_years = eligibility.ageYears;
    values.minimum_eligible_age_years = eligibility.minimumAge;
  }

  const payload = buildProfilePayload({
    user,
    values: {
      ...values,
      username: normalizedUsername || values.username || ''
    },
    existingProfile,
    policy
  });

  const currentProfile = existingProfile || await getSupabaseProfileByAuthUserId(supabase, user.id || user.uid);
  const existingRecordId = currentProfile?.id || null;

  const supabasePayload = {
    auth_user_id: user.id || user.uid,
    username: payload.username || normalizedUsername || currentProfile?.username || '',
    display_name: payload.display_name || '',
    avatar_url: payload.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
    bio: payload.public_summary || currentProfile?.bio || '',
    visibility_state: payload.public_profile_enabled ? 'public' : 'private',
    profile_status: payload.profile_status || currentProfile?.profile_status || 'active',
    public_profile_enabled: payload.public_profile_enabled === true,
    public_profile_discoverable: payload.public_profile_discoverable === true,
    public_display_name: payload.public_display_name || '',
    public_identity_label: payload.public_identity_label || '',
    public_summary: payload.public_summary || '',
    public_primary_link: payload.public_primary_link || '',
    email: payload.email || normalizeEmail(user.email || ''),
    first_name: payload.first_name || '',
    last_name: payload.last_name || '',
    date_of_birth: payload.date_of_birth || payload.birth_date || '',
    birth_date: payload.birth_date || payload.date_of_birth || '',
    gender: payload.gender || '',
    username_lower: payload.username_lower || normalizeUsername(payload.username || normalizedUsername || ''),
    username_normalized: payload.username_lower || normalizeUsername(payload.username || normalizedUsername || '')
  };

  if (existingRecordId) {
    const { data, error } = await supabase
      .from(PROFILE_COLLECTION)
      .update(supabasePayload)
      .eq('id', existingRecordId)
      .select(SUPABASE_PROFILE_SELECT_FIELDS)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await supabase
    .from(PROFILE_COLLECTION)
    .insert(supabasePayload)
    .select(SUPABASE_PROFILE_SELECT_FIELDS)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function persistProfile(scope, values, existingProfile, user, policy, firestore) {
  const normalizedUsername = normalizeUsername(values.username || existingProfile?.username || '');

  if (scope === 'visibility' && values.public_profile_enabled && !normalizedUsername) {
    const error = new Error('USERNAME_REQUIRED');
    error.code = 'USERNAME_REQUIRED';
    throw error;
  }

  if (values.date_of_birth) {
    const eligibility = evaluateEligibility(values.date_of_birth, policy);
    if (!eligibility.eligible) {
      const error = new Error(eligibility.reason || 'INVALID_DATE_OF_BIRTH');
      error.code = eligibility.reason || 'INVALID_DATE_OF_BIRTH';
      throw error;
    }

    values.eligibility_age_years = eligibility.ageYears;
    values.minimum_eligible_age_years = eligibility.minimumAge;
  }

  if (normalizedUsername) {
    return reserveUsernameProfile({
      firestore,
      user,
      values: {
        ...values,
        username: normalizedUsername
      },
      policy,
      profileCollection: PROFILE_COLLECTION,
      reservationCollection: USERNAME_RESERVATION_COLLECTION
    });
  }

  const payload = buildProfilePayload({
    user,
    values,
    existingProfile,
    policy
  });

  await firestore.collection(PROFILE_COLLECTION).doc(user.uid).set(payload, { merge: true });
  return payload;
}

async function handleSaveRequest(form) {
  const scope = normalizeString(form?.dataset?.profileSaveScope || '');
  if (!SAVE_SCOPES.includes(scope)) return;

  setScopeState(scope, {
    status: 'saving',
    code: '',
    message: 'Saving changes…'
  });

  try {
    const supabase = getSupabaseClient();

    if (supabase) {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        throw sessionError;
      }

      const user = sessionData?.session?.user || null;
      if (!user?.id) {
        const error = new Error('AUTH_REQUIRED');
        error.code = 'AUTH_REQUIRED';
        throw error;
      }

      const policy = await loadProfileIdentityPolicy();
      const existingProfile = await getSupabaseProfileByAuthUserId(supabase, user.id);
      const values = buildScopedValues(scope, form, existingProfile, user);

      await persistProfileWithSupabase(scope, values, existingProfile, user, policy, supabase);
    } else {
      const ready = await waitForFirebaseReady();
      if (!ready) {
        const error = new Error('FIREBASE_NOT_READY');
        error.code = 'FIREBASE_NOT_READY';
        throw error;
      }

      const auth = getFirebaseAuth();
      const firestore = getFirestore();
      const user = auth?.currentUser || null;

      if (!auth || !firestore || !user?.uid) {
        const error = new Error('AUTH_REQUIRED');
        error.code = 'AUTH_REQUIRED';
        throw error;
      }

      const policy = await loadProfileIdentityPolicy();
      const existingProfile = await getProfileByUid({
        firestore,
        uid: user.uid,
        profileCollection: PROFILE_COLLECTION
      });
      const values = buildScopedValues(scope, form, existingProfile, user);

      await persistProfile(scope, values, existingProfile, user, policy, firestore);
    }

    setScopeState(scope, {
      status: 'success',
      code: '',
      message: 'Profile settings saved.'
    });

    document.dispatchEvent(new CustomEvent('account:profile-refresh-request', {
      detail: {
        source: 'profile-save',
        scope
      }
    }));
  } catch (error) {
    const code = resolveProfileSaveErrorCode(error);
    setScopeState(scope, {
      status: 'error',
      code,
      message: messageForProfileSaveError(code)
    });
    console.error('[profile-save] Save failed.', error);
  }
}

/* =============================================================================
   10) EVENT BINDING
============================================================================= */
function bindFormSaves() {
  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (!form.hasAttribute('data-profile-save-form')) return;

    event.preventDefault();
    void handleSaveRequest(form);
  });
}

/* =============================================================================
   11) INITIALIZATION
============================================================================= */
function initProfileSave() {
  if (RUNTIME.initialized) return;
  RUNTIME.initialized = true;

  RUNTIME.state = createDefaultState();
  bindFormSaves();
}

initProfileSave();

/* =============================================================================
   12) END OF FILE
============================================================================= */
