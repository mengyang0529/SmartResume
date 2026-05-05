import localforage from 'localforage';
import { EditorState } from '@app-types/editorState';

const STORAGE_KEY_V2 = 'resume_v2';
const STORAGE_KEY_PHOTO = 'resume_photo';

export const storage = {
  async saveState(state: EditorState): Promise<void> {
    // Strip large photo data from state before saving
    const stateToSave = {
      ...state,
      personal: {
        ...state.personal,
        photo: state.personal.photo ? { ...state.personal.photo, url: '__stored__' } : undefined,
      },
    };
    await localforage.setItem(STORAGE_KEY_V2, stateToSave);
  },

  async getState(): Promise<EditorState | null> {
    return localforage.getItem<EditorState>(STORAGE_KEY_V2);
  },

  async savePhoto(dataUrl: string): Promise<void> {
    await localforage.setItem(STORAGE_KEY_PHOTO, dataUrl);
  },

  async getPhoto(): Promise<string | null> {
    return localforage.getItem<string>(STORAGE_KEY_PHOTO);
  },

  async removePhoto(): Promise<void> {
    await localforage.removeItem(STORAGE_KEY_PHOTO);
  },

  async clearState(): Promise<void> {
    await Promise.all([
      localforage.removeItem(STORAGE_KEY_V2),
      localforage.removeItem(STORAGE_KEY_PHOTO),
    ]);
  },

  async getLegacyItem<T>(key: string): Promise<T | null> {
    return localforage.getItem<T>(key);
  },

  async removeLegacyItem(key: string): Promise<void> {
    await localforage.removeItem(key);
  },
};
