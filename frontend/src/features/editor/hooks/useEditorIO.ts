import { useCallback } from 'react';
import type { EditorState } from '@app-types/editorState';
import { parseMarkdownResume } from '../services/markdownParser';
import { generateMarkdownResume } from '../services/markdownGenerator';
import { downloadBlob } from '@shared/utils/download';

interface UseEditorIOOptions {
  state: EditorState;
  onImport: (parsed: any) => void;
}

export function useEditorIO({ state, onImport }: UseEditorIOOptions) {
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const raw = reader.result as string;
          const parsed = parseMarkdownResume(raw);
          onImport(parsed);
        } catch (error) {
          // P0-1: 修复静默错误吞掉的问题，至少给出用户提示
          console.error('Failed to parse markdown:', error);
          alert('Failed to import file. Please check if the format is valid Markdown Resume.');
        }
      };
      
      reader.onerror = () => {
        alert('Failed to read file.');
      };

      reader.readAsText(file);
      // Reset input value to allow uploading the same file again
      event.target.value = '';
    },
    [onImport]
  );

  const handleExportMarkdown = useCallback(() => {
    const md = generateMarkdownResume({
      personal: state.personal,
      contentBlocks: state.contentBlocks,
      supplementaryBlocks: state.supplementaryBlocks,
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    downloadBlob(blob, `${state.personal.firstName || 'resume'}-backup.md`);
  }, [state]);

  return {
    handleFileUpload,
    handleExportMarkdown,
  };
}
