import { lazy } from "react"
import { MainLayout, UserLayout, VideoCallLayout } from "@layouts"
import { PageNotFound, ForbiddenPage } from "@/shared/pages"

// Guest Pages
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

// Language routing components
import LanguageLayout from "./LanguageLayout"
import { LazyRoute, RootLayout, RootRoute } from "./RouteShells"

import { Navigate } from "react-router-dom"
import { AuthGuard } from "@/shared/components"

const ReelsPage = lazy(() => import("@/features/reels/ReelsPage"))
const ReelDetailPage = lazy(() => import("@/features/reels/pages/ReelDetailPage"))
const WorkspaceReelsPage = lazy(() => import("@/features/reels/pages/WorkspaceReelsPage"))
const WorkspaceReelDetailPage = lazy(() => import("@/features/reels/pages/WorkspaceReelDetailPage"))
const BillingFeature = lazy(() => import("@/features/billing/index.jsx"))
const PaymentResultPage = lazy(() => import("@/features/billing/pages/PaymentResultPage.jsx"))
const PricingPage = lazy(() => import("@/features/billing/pages/PricingPage.jsx"))

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
          {
            path: "pricing",
            element: (
              <LazyRoute>
                <PricingPage />
              </LazyRoute>
            ),
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
                    path: "reels",
                    element: (
                      <LazyRoute>
                        <ReelsPage />
                      </LazyRoute>
                    ),
                  },
                  {
                    path: "reels/:id",
                    element: (
                      <LazyRoute>
                        <ReelDetailPage />
                      </LazyRoute>
                    ),
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
            <MainLayout />
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
              {
                path: "reels",
                element: (
                  <LazyRoute>
                    <WorkspaceReelsPage />
                  </LazyRoute>
                ),
              },
              {
                path: "reels/:id",
                element: (
                  <LazyRoute>
                    <WorkspaceReelDetailPage />
                  </LazyRoute>
                ),
              },
              { path: "*", element: <PageNotFound /> },
            ],
          },
        ],
      },

      {
        element: (
          <AuthGuard>
            <MainLayout showFooter={false} />
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
              {
                path: "billing",
                element: (
                  <LazyRoute>
                    <BillingFeature />
                  </LazyRoute>
                ),
              },
              {
                path: "billing/result",
                element: (
                  <LazyRoute>
                    <PaymentResultPage />
                  </LazyRoute>
                ),
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
        path: "/events",
        element: <MainLayout showHeader={false} showFooter={false} />,
        children: [
          {
            path: "shared/:token",
            element: <SharedEventPage />,
          },
        ],
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
