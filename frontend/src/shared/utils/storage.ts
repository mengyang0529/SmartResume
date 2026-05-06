import localforage from 'localforage';
import { EditorState } from '@app-types/editorState';

const STORAGE_KEY_V2 = 'resume_v2';
const STORAGE_KEY_PHOTO = 'resume_photo';

export const storage = {
  async saveState(state: EditorState): Promise<void> {
    try {
      const stateToSave = {
        ...state,
        personal: {
          ...state.personal,
          photo: state.personal.photo ? { ...state.personal.photo, url: '__stored__' } : undefined,
        },
      };
      await localforage.setItem(STORAGE_KEY_V2, stateToSave);
    } catch (err) {
      console.warn('Failed to save state to IndexedDB:', err);
    }
  },

  async getState(): Promise<EditorState | null> {
    try {
      return localforage.getItem<EditorState>(STORAGE_KEY_V2);
    } catch (err) {
      console.warn('Failed to load state from IndexedDB:', err);
      return null;
    }
  },

  async savePhoto(dataUrl: string): Promise<void> {
    try {
      await localforage.setItem(STORAGE_KEY_PHOTO, dataUrl);
    } catch (err) {
      console.warn('Failed to save photo to IndexedDB:', err);
    }
  },

  async getPhoto(): Promise<string | null> {
    try {
      return localforage.getItem<string>(STORAGE_KEY_PHOTO);
    } catch (err) {
      console.warn('Failed to load photo from IndexedDB:', err);
      return null;
    }
  },

  async removePhoto(): Promise<void> {
    try {
      await localforage.removeItem(STORAGE_KEY_PHOTO);
    } catch (err) {
      console.warn('Failed to remove photo from IndexedDB:', err);
    }
  },

  async clearState(): Promise<void> {
    try {
      await Promise.all([
        localforage.removeItem(STORAGE_KEY_V2),
        localforage.removeItem(STORAGE_KEY_PHOTO),
      ]);
    } catch (err) {
      console.warn('Failed to clear state from IndexedDB:', err);
    }
  },

  async getLegacyItem<T>(key: string): Promise<T | null> {
    try {
      return localforage.getItem<T>(key);
    } catch (err) {
      console.warn('Failed to load legacy item from IndexedDB:', err);
      return null;
    }
  },

  async removeLegacyItem(key: string): Promise<void> {
    try {
      await localforage.removeItem(key);
    } catch (err) {
      console.warn('Failed to remove legacy item from IndexedDB:', err);
    }
  },
};
