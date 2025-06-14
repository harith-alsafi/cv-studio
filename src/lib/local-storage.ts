import { Generation, User } from "@/types/user";
import CryptoJS from "crypto-js";

// Keys for localStorage
const USER_STORAGE_KEY = "app_user_data";
const USER_INITIALIZED_KEY = "app_user_initialized";
const CURRENT_GENERATION_KEY = "app_current_generation";

const ENCRYPTION_KEY = process.env.NODE_ENV === "development" ? "test" : process.env.ENCRYPTION_KEY || "default-encryption-key";

function encryptData(data: object): string {
  const jsonData = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonData, ENCRYPTION_KEY).toString();
}

// Decrypt data
function decryptData(encrypted: string): any | null {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Error decrypting data:", error);
    return null;
  }
}


// Load user
export function loadUserFromStorage(): User | null {
  try {
    const encrypted = localStorage.getItem(USER_STORAGE_KEY);
    return encrypted ? decryptData(encrypted) : null;
  } catch (error) {
    console.error("Error loading user from localStorage:", error);
    return null;
  }
}

// Save user
export function saveUserToStorage(userData: User | null) {
  try {
    if (userData) {
      const encrypted = encryptData(userData);
      localStorage.setItem(USER_STORAGE_KEY, encrypted);
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Error saving user to localStorage:", error);
  }
}

// Load generation
export function loadCurrentGenerationFromStorage(): Generation | null {
  try {
    const encrypted = localStorage.getItem(CURRENT_GENERATION_KEY);
    return encrypted ? decryptData(encrypted) : null;
  } catch (error) {
    console.error("Error loading current generation from localStorage:", error);
    return null;
  }
}

// Save generation
export function saveCurrentGenerationToStorage(generation: Generation | null) {
  try {
    if (generation) {
      const encrypted = encryptData(generation);
      localStorage.setItem(CURRENT_GENERATION_KEY, encrypted);
    } else {
      localStorage.removeItem(CURRENT_GENERATION_KEY);
    }
  } catch (error) {
    console.error("Error saving current generation to localStorage:", error);
  }
}

export function isUserInitialized(): boolean {
  return localStorage.getItem(USER_INITIALIZED_KEY) === "true";
}

export function setUserInitialized(value: boolean) {
  localStorage.setItem(USER_INITIALIZED_KEY, value ? "true" : "false");
}

export function clearUserStorage() {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(CURRENT_GENERATION_KEY);
    localStorage.removeItem(USER_INITIALIZED_KEY);
  } catch (error) {
    console.error("Error clearing user storage:", error);
  }
}