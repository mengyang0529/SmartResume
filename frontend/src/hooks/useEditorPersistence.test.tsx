import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useEditorPersistence } from './useEditorPersistence';
import { storage } from '@utils/storage';
import { EditorState } from '@app-types/editorState';

vi.mock('@utils/storage', () => ({
  storage: {
    saveState: vi.fn(),
    getState: vi.fn(),
    savePhoto: vi.fn(),
    getPhoto: vi.fn(),
    removePhoto: vi.fn(),
    getLegacyItem: vi.fn(),
    removeLegacyItem: vi.fn(),
  },
}));

const mockState: EditorState = {
  version: 2,
  personal: {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    position: '',
    photo: { url: '__stored__', shape: 'circle' },
  },
  contentBlocks: [],
  supplementaryBlocks: [],
  templateSlug: 'classic',
};

describe('useEditorPersistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load state from v2 storage on mount', async () => {
    const setState = vi.fn();
    const setIsSample = vi.fn();
    vi.mocked(storage.getState).mockResolvedValue(mockState);
    vi.mocked(storage.getPhoto).mockResolvedValue('photo-data');

    renderHook(() =>
      useEditorPersistence({
        templateId: 'classic',
        state: mockState,
        setState,
        setIsSample,
      })
    );

    await waitFor(() => {
      expect(storage.getState).toHaveBeenCalled();
    });

    expect(setState).toHaveBeenCalledWith({
      ...mockState,
      personal: { ...mockState.personal, photo: { url: 'photo-data', shape: 'circle' } },
    });
  });

  it('should auto-save state with debounce', async () => {
    vi.useFakeTimers();
    const setState = vi.fn();
    const setIsSample = vi.fn();

    const { rerender } = renderHook(
      ({ state }) =>
        useEditorPersistence({
          templateId: 'classic',
          state,
          setState,
          setIsSample,
        }),
      {
        initialProps: { state: mockState },
      }
    );

    // Change state
    const newState = { ...mockState, personal: { ...mockState.personal, firstName: 'Changed' } };
    rerender({ state: newState });

    // Should not have saved yet
    expect(storage.saveState).not.toHaveBeenCalled();

    // Fast-forward time
    vi.advanceTimersByTime(800);

    expect(storage.saveState).toHaveBeenCalledWith(newState);
    vi.useRealTimers();
  });

  it('should save photo only when it changes', async () => {
    vi.useFakeTimers();
    const setState = vi.fn();
    const setIsSample = vi.fn();
    const stateWithPhoto = {
      ...mockState,
      personal: { ...mockState.personal, photo: { url: 'photo-v1', shape: 'circle' as const } },
    };

    const { rerender } = renderHook(
      ({ state }) =>
        useEditorPersistence({
          templateId: 'classic',
          state,
          setState,
          setIsSample,
        }),
      {
        initialProps: { state: stateWithPhoto },
      }
    );

    // Initial save (after debounce)
    vi.advanceTimersByTime(800);
    expect(storage.savePhoto).toHaveBeenCalledWith('photo-v1');
    vi.mocked(storage.savePhoto).mockClear();

    // Change something else in state
    const stateWithNewName = {
      ...stateWithPhoto,
      personal: { ...stateWithPhoto.personal, firstName: 'New Name' },
    };
    rerender({ state: stateWithNewName });
    vi.advanceTimersByTime(800);

    // saveState should be called, but savePhoto should NOT
    expect(storage.saveState).toHaveBeenCalled();
    expect(storage.savePhoto).not.toHaveBeenCalled();

    // Change photo
    const stateWithNewPhoto = {
      ...stateWithNewName,
      personal: { ...stateWithNewName.personal, photo: { url: 'photo-v2', shape: 'circle' as const } },
    };
    rerender({ state: stateWithNewPhoto });
    vi.advanceTimersByTime(800);

    expect(storage.savePhoto).toHaveBeenCalledWith('photo-v2');
    vi.useRealTimers();
  });
});
