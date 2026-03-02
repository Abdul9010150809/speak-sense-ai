const TOKEN_KEY = "token";
const USER_KEY = "user";
const REMEMBER_ME_KEY = "rememberMe";
const REMEMBERED_EMAIL_KEY = "rememberedEmail";

const readStorage = (storage, key) => {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (storage, key, value) => {
  try {
    storage.setItem(key, value);
  } catch {
    // ignore storage write failures
  }
};

const removeStorage = (storage, key) => {
  try {
    storage.removeItem(key);
  } catch {
    // ignore storage delete failures
  }
};

export const getAuthToken = () => {
  const token = readStorage(localStorage, TOKEN_KEY) || readStorage(sessionStorage, TOKEN_KEY) || "";
  if (!token) return "";

  const normalized = String(token).trim().toLowerCase();
  if (normalized === "undefined" || normalized === "null" || normalized === "false") {
    return "";
  }

  return token;
};

export const getStoredUser = () => {
  const raw = readStorage(localStorage, USER_KEY) || readStorage(sessionStorage, USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getRememberMePreference = () => {
  return readStorage(localStorage, REMEMBER_ME_KEY) === "true";
};

export const getRememberedEmail = () => {
  return readStorage(localStorage, REMEMBERED_EMAIL_KEY) || "";
};

export const saveAuthSession = ({ token, user, rememberMe = false, email = "" }) => {
  const activeStorage = rememberMe ? localStorage : sessionStorage;
  const inactiveStorage = rememberMe ? sessionStorage : localStorage;

  removeStorage(inactiveStorage, TOKEN_KEY);
  removeStorage(inactiveStorage, USER_KEY);

  if (token) {
    writeStorage(activeStorage, TOKEN_KEY, token);
  }

  if (user) {
    writeStorage(activeStorage, USER_KEY, JSON.stringify(user));
  }

  writeStorage(localStorage, REMEMBER_ME_KEY, String(rememberMe));

  if (rememberMe && email) {
    writeStorage(localStorage, REMEMBERED_EMAIL_KEY, email);
  } else {
    removeStorage(localStorage, REMEMBERED_EMAIL_KEY);
  }
};

export const saveStoredUser = (user) => {
  if (!user) return;
  const hasPersistentToken = Boolean(readStorage(localStorage, TOKEN_KEY));
  const targetStorage = hasPersistentToken ? localStorage : sessionStorage;
  writeStorage(targetStorage, USER_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
  removeStorage(localStorage, TOKEN_KEY);
  removeStorage(localStorage, USER_KEY);
  removeStorage(sessionStorage, TOKEN_KEY);
  removeStorage(sessionStorage, USER_KEY);
};
