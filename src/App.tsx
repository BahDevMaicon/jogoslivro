import { Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { AppBackground } from "@/components/layout/AppBackground";
import { RequireAuth } from "@/components/layout/RequireAuth";
import HomePage from "@/pages/HomePage";
import LibraryPage from "@/pages/LibraryPage";
import BookDetailsPage from "@/pages/BookDetailsPage";
import CharacterCreationPage from "@/pages/CharacterCreationPage";
import ReadingPage from "@/pages/ReadingPage";
import BookEditorPage from "@/pages/BookEditorPage";
import LoginPage from "@/pages/LoginPage";
import AboutPage from "@/pages/AboutPage";
import ProfilePage from "@/pages/ProfilePage";
import MyLibraryPage from "@/pages/MyLibraryPage";
import MyBooksPage from "@/pages/MyBooksPage";
import AdminPage from "@/pages/AdminPage";
import { useSettingsStore } from "@/stores/settingsStore";
import { useEffect } from "react";

export default function App() {
  const theme = useSettingsStore((s) => s.settings.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("theme-parchment", theme === "parchment");
  }, [theme]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-nightwood-950">
        <AppBackground />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/biblioteca" element={<LibraryPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route
            path="/perfil"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/minha-biblioteca"
            element={
              <RequireAuth>
                <MyLibraryPage />
              </RequireAuth>
            }
          />
          <Route
            path="/meus-livros"
            element={
              <RequireAuth roles={["premium", "admin"]}>
                <MyBooksPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth roles={["admin"]}>
                <AdminPage />
              </RequireAuth>
            }
          />
          <Route
            path="/create-book"
            element={
              <RequireAuth roles={["premium", "admin"]}>
                <BookEditorPage />
              </RequireAuth>
            }
          />
          <Route
            path="/edit-book/:bookId"
            element={
              <RequireAuth roles={["premium", "admin"]}>
                <BookEditorPage />
              </RequireAuth>
            }
          />
          <Route path="/book/:bookId" element={<BookDetailsPage />} />
          <Route path="/book/:bookId/create" element={<CharacterCreationPage />} />
          <Route path="/book/:bookId/play" element={<ReadingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}
