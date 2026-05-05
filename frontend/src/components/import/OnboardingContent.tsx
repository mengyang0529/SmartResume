import { Step1And2 } from './Step1And2';
import { Step3AISettings } from './Step3AISettings';
import { Step4Import } from './Step4Import';

interface OnboardingContentProps {
  templateName: string;
  downloadSchema: () => void;
  isConverting: boolean;
  convertedImages: string[];
  pdfInputRef: React.RefObject<HTMLInputElement>;
  handlePdfUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  markdown: string;
  isImporting: boolean;
  handleFileImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImport: () => void;
  setMarkdown: (v: string) => void;
}

export function OnboardingContent({
  templateName,
  downloadSchema,
  isConverting,
  convertedImages,
  pdfInputRef,
  handlePdfUpload,
  markdown,
  isImporting,
  handleFileImport,
  handleImport,
  setMarkdown,
}: OnboardingContentProps) {
  return (
    <div className="space-y-10">
      <div className="space-y-8">
        <Step1And2
          templateName={templateName}
          downloadSchema={downloadSchema}
          isConverting={isConverting}
          convertedImages={convertedImages}
          pdfInputRef={pdfInputRef}
          handlePdfUpload={handlePdfUpload}
        />

        <Step3AISettings convertedImages={convertedImages} />

        <Step4Import
          markdown={markdown}
          isImporting={isImporting}
          handleFileImport={handleFileImport}
          handleImport={handleImport}
          setMarkdown={setMarkdown}
        />
      </div>
    </div>
  );
}
