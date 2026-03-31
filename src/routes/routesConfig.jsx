import { AdminLayout, MainLayout, UserLayout, VideoCallLayout } from "@layouts"
import { PageNotFound, ForbiddenPage } from "@/shared/pages"

// Guest Pages
import LandingPage from "@/features/landing/pages/LandingPage"
import PolicyPage from "@/features/auth/pages/PolicyPage"
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage"
import VerifyEmailPage from "@/features/auth/pages/VerifyEmailPage"
import VideoCallRoom from "@/features/video-call/pages/VideoCallRoom"
import QueuePage from "@/features/queue/pages/QueuePage"
import RoomsPage from "@/features/rooms/pages/RoomsPage"


// Cat Speak Feature Pages
import CatSpeakLayout from "@/features/cat-speak/layouts/CatSpeakLayout"
import NewsPage from "@/features/news/pages/NewsPage"
import NewsDetailPage from "@/features/news/pages/NewsDetailPage"
import DiscoverPage from "@/features/discover/DiscoverPage"
import VideoPage from "@/features/video/VideoPage"
import MailPage from "@/features/mail/pages/MailPage"
import SharedEventPage from "@/features/calendar/pages/SharedEventPage"

// Shared Pages
import { ComingSoonPage } from "@/shared/pages"

// User & Admin Pages
import UserDashboard from "@/features/user/pages/UserDashboard"
import ProfileLayout from "@/features/user/layouts/ProfileLayout"
import PersonalInformationPage from "@/features/user/pages/PersonalInformationPage"
import LecturerPage from "@/features/user/pages/LecturerPage"
import OrganizationPage from "@/features/user/pages/OrganizationPage"
import AccountSettingsPage from "@/features/user/pages/AccountSettingsPage"
import SettingsPage from "@/features/settings/pages/SettingsPage"
import { AdminPage } from "@/features/admin/pages/AdminPage"

// Language routing components
import LanguageLayout from "./LanguageLayout"

import { Navigate } from "react-router-dom"
import { useAuth } from "@/features/auth"
import { AuthGuard } from "@/shared/components"

const RootRoute = () => {
  return <LandingPage />
}

const routesConfig = [
  // Main layout routes (no language prefix)
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <RootRoute />,
      },
      {
        path: "reset-password",
        element: <ResetPasswordPage />,
      },
      {
        path: "verify-email",
        element: <VerifyEmailPage />,
      },
      { path: "*", element: <PageNotFound /> },
    ],
  },

  // Language-prefixed community route
  {
    path: "/:lang/community",
    element: <LanguageLayout />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <RoomsPage />,
          },
          { path: "*", element: <PageNotFound /> },
        ],
      },
    ],
  },

  // Language-prefixed cat-speak routes
  {
    path: "/:lang/cat-speak",
    element: <LanguageLayout />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            element: <CatSpeakLayout />,
            children: [
              {
                index: true,
                element: <Navigate to="news" replace />,
              },
              {
                path: "news",
                element: <NewsPage />,
              },
              {
                path: "news/:id",
                element: <NewsDetailPage />,
              },
              {
                path: "discover",
                element: <DiscoverPage />,
              },
              {
                path: "video",
                element: <VideoPage />,
              },
              {
                path: "mail",
                element: <MailPage />,
              },
              { path: "*", element: <PageNotFound /> },
            ],
          },
        ],
      },
    ],
  },

  // Language-prefixed video call route
  {
    path: "/:lang/meet",
    element: <LanguageLayout />,
    children: [
      {
        element: <VideoCallLayout />,
        children: [
          {
            path: ":id",
            element: (
              <AuthGuard>
                <VideoCallRoom />
              </AuthGuard>
            ),
          },
          { path: "*", element: <PageNotFound /> },
        ],
      },
    ],
  },


  {
    path: "/policy",
    element: <PolicyPage />,
  },
  {
    element: (
      <AuthGuard>
        <UserLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: "app",
        children: [
          {
            index: true,
            element: <UserDashboard />,
          },
          {
            path: "setting",
            element: <SettingsPage />,
          },
          { path: "*", element: <PageNotFound /> },
        ],
      },
    ],
  },
  {
    element: (
      <AuthGuard>
        <UserLayout showFooter={false} />
      </AuthGuard>
    ),
    children: [
      {
        element: <ProfileLayout />,
        children: [
          {
            path: "profile",
            element: <PersonalInformationPage />,
          },
          {
            path: "lecturer",
            element: <LecturerPage />,
          },
          {
            path: "organization",
            element: <OrganizationPage />,
          },
          {
            path: "setting",
            element: <AccountSettingsPage />,
          },
          { path: "*", element: <PageNotFound /> },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <AuthGuard allowedRoles={["Admin"]}>
        <AdminLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <AdminPage />,
      },
      { path: "*", element: <PageNotFound /> },
    ],
  },
  {
    path: "/queue",
    element: (
      <AuthGuard>
        <QueuePage />
      </AuthGuard>
    ),
  },
  {
    path: "/cart",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <ComingSoonPage />,
      },
      { path: "*", element: <PageNotFound /> },
    ],
  },
  {
    path: "/connect",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <ComingSoonPage />,
      },
    ],
  },
  {
    path: "/events/shared/:token",
    element: <SharedEventPage />,
  },
  {
    path: "/403",
    element: <ForbiddenPage />,
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
]

export default routesConfig
