import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEditorState } from './useEditorState';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock dependencies
vi.mock('../../template-renderer/hooks/usePdfCompiler', () => ({
  usePdfCompiler: () => ({
    pdfUrl: null,
    compileError: null,
    isCompiling: false,
    handleRefreshPreview: vi.fn(),
    handleDownloadPdf: vi.fn(),
  }),
}));

vi.mock('./useEditorPersistence', () => ({
  useEditorPersistence: () => ({
    openImportFile: vi.fn(),
    fileInputRef: { current: null },
  }),
}));

vi.mock('@shared/utils/storage', () => ({
  storage: {
    saveState: vi.fn(),
    getState: vi.fn(),
    savePhoto: vi.fn(),
    getPhoto: vi.fn(),
    removePhoto: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/editor/modern']}>
    <Routes>
      <Route path="/editor/:templateId" element={children} />
    </Routes>
  </MemoryRouter>
);

describe('useEditorState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with templateId from params', () => {
    const { result } = renderHook(() => useEditorState(), { wrapper });

    expect(result.current.data.templateSlug).toBe('modern');
    expect(result.current.data.personal.firstName).toBe('');
  });

  it('should update personal info', () => {
    const { result } = renderHook(() => useEditorState(), { wrapper });

    act(() => {
      result.current.actions.setPersonal({
        ...result.current.data.personal,
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    expect(result.current.data.personal.firstName).toBe('John');
    expect(result.current.data.personal.lastName).toBe('Doe');
  });

  it('should add a section', () => {
    const { result } = renderHook(() => useEditorState(), { wrapper });

    act(() => {
      result.current.actions.addSection();
    });

    expect(result.current.data.contentBlocks.length).toBe(1);
    expect(result.current.data.contentBlocks[0].type).toBe('h1');
    expect(result.current.data.contentBlocks[0].content).toBe('New Section');
  });

  it('should handle photo remove', () => {
    const { result } = renderHook(() => useEditorState(), { wrapper });

    act(() => {
      result.current.actions.setPersonal({
        ...result.current.data.personal,
        photo: { url: 'data:image/png;base64,xxx', shape: 'circle' },
      });
    });

    expect(result.current.data.personal.photo).toBeDefined();

    act(() => {
      result.current.photo.remove();
    });

    expect(result.current.data.personal.photo).toBeUndefined();
  });
});
