import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import ResumeEditorPage from './pages/ResumeEditorPage';
import TemplatesPage from './pages/TemplatesPage';
import ImportPage from './pages/ImportPage';

import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="import/:templateId" element={<ImportPage />} />
        <Route path="editor" element={<ResumeEditorPage />} />
        <Route path="editor/:templateId" element={<ResumeEditorPage />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
