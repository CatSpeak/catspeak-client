import { MainLayout, UserLayout, VideoCallLayout } from "@layouts"
import { PageNotFound, ForbiddenPage } from "@/shared/pages"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useRegisterNavigate } from "@/features/video-call/context/GlobalVideoCallProvider"

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
import CalendarPage from "@/features/calendar/pages/CalendarPage"

// Shared Pages
import { ComingSoonPage } from "@/shared/pages"

// User & Admin Pages
import UserDashboard from "@/features/user/pages/UserDashboard"
import ProfileLayout from "@/features/user/layouts/ProfileLayout"
import PersonalInformationPage from "@/features/user/pages/PersonalInformationPage"
import RecordingsPage from "@/features/recordings/pages/RecordingsPage"
import WorkspaceLayout from "@/features/workspace/layouts/WorkspaceLayout"
import InstructorPage from "@/features/user/pages/InstructorPage"
import OrganizationPage from "@/features/user/pages/OrganizationPage"
import AccountSettingsPage from "@/features/user/pages/AccountSettingsPage"
import SettingsPage from "@/features/settings/pages/SettingsPage"

// Language routing components
import LanguageLayout from "./LanguageLayout"

import { Navigate } from "react-router-dom"
import { useAuth } from "@/features/auth"
import { AuthGuard } from "@/shared/components"

/**
 * Root layout that registers the router's navigate function
 * for the GlobalVideoCallProvider (which lives above the router).
 */
const RootLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  useRegisterNavigate(navigate, location)
  return <Outlet />
}

const RootRoute = () => {
  return <LandingPage />
}

const routesConfig = [
  {
    // Root wrapper — registers navigate for global PiP provider
    element: <RootLayout />,
    children: [
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
                  {
                    path: "calendar",
                    element: <CalendarPage />,
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
      // Workspace routes
      {
        path: "/workspace",
        element: (
          <AuthGuard>
            <UserLayout showFooter={false} />
          </AuthGuard>
        ),
        children: [
          {
            element: <WorkspaceLayout />,
            children: [
              {
                index: true,
                element: <Navigate to="recordings" replace />,
              },
              {
                path: "recordings",
                element: <RecordingsPage />,
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
                path: "instructor",
                element: <InstructorPage />,
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
    ], // end RootLayout children
  }, // end RootLayout wrapper
]

export default routesConfig
