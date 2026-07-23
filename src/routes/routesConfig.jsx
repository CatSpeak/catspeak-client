import { lazy } from "react";
import { MainLayout, VideoCallLayout } from "@layouts";
import { PageNotFound, ForbiddenPage } from "@/shared/pages";

// Guest Pages
import PolicyPage from "@/features/auth/pages/PolicyPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import VerifyEmailPage from "@/features/auth/pages/VerifyEmailPage";
import VideoCallRoom from "@/features/video-call/pages/VideoCallRoom";
import QueuePage from "@/features/queue/pages/QueuePage";
import RoomsPage from "@/features/rooms/pages/RoomsPage";

// Cat Speak Feature Pages
import CatSpeakLayout from "@/features/cat-speak/layouts/CatSpeakLayout";
import NewsPage from "@/features/news/pages/NewsPage";
import NewsDetailPage from "@/features/news/pages/NewsDetailPage";
import DiscoverPage from "@/features/discover/DiscoverPage";
import MailPage from "@/features/mail/pages/MailPage";
import SharedEventPage from "@/features/calendar/pages/SharedEventPage";
import CalendarPage from "@/features/calendar/pages/CalendarPage";
import CreateEventPage from "@/features/calendar/pages/CreateEventPage";

// Shared Pages
import { ComingSoonPage } from "@/shared/pages";

// User & Admin Pages
import UserDashboard from "@/features/user/pages/UserDashboard";

import UserPagesLayout from "@/features/user/layouts/UserPagesLayout";
// Language routing components
import LanguageLayout from "./LanguageLayout";
import { LazyRoute, RootLayout, RootRoute } from "./RouteShells";

import { Navigate } from "react-router-dom";
import { AuthGuard } from "@/shared/components";

import WorkspaceCourseRedirect from "@/features/courses/components/WorkspaceCourseRedirect";
import WebsitePage from "@/features/websites/WebsitePage";

const Profile = lazy(() => import("@/features/profile/pages/Profile"));
const AccountInfoPage = lazy(
  () => import("@/features/settings/pages/AccountInfoPage"),
);
const RecordingsPage = lazy(
  () => import("@/features/recordings/pages/RecordingsPage"),
);
const WorkspaceLayout = lazy(
  () => import("@/features/workspace/layouts/WorkspaceLayout"),
);
const InstructorPage = lazy(
  () => import("@/features/user/pages/InstructorPage"),
);
const OrganizationPage = lazy(
  () => import("@/features/user/pages/OrganizationPage"),
);
const SystemSettingsPage = lazy(
  () => import("@/features/settings/pages/SystemSettingsPage"),
);

const ReelsPage = lazy(() => import("@/features/reels/ReelsPage"));
const ChatPage = lazy(() => import("@/features/chat/pages/ChatPage"));
const ReelDetailPage = lazy(
  () => import("@/features/reels/pages/ReelDetailPage"),
);
const WorkspaceReelsPage = lazy(
  () => import("@/features/reels/pages/WorkspaceReelsPage"),
);
const WorkspaceReelDetailPage = lazy(
  () => import("@/features/reels/pages/WorkspaceReelDetailPage"),
);

const WorkspaceEventsPage = lazy(
  () => import("@/features/calendar/pages/WorkspaceEventsPage"),
);
const BillingFeature = lazy(() => import("@/features/billing/index.jsx"));
const MyLearningPage = lazy(
  () => import("@/features/courses/pages/MyLearningPage"),
);
const PaymentResultPage = lazy(
  () => import("@/features/billing/pages/PaymentResultPage.jsx"),
);
const PricingPage = lazy(
  () => import("@/features/billing/pages/PricingPage.jsx"),
);
const CheckoutPage = lazy(
  () => import("@/features/billing/pages/CheckoutPage.jsx"),
);
const MyCoursesPage = lazy(
  () => import("@/features/courses/pages/MyCoursesPage"),
);
const CreateCoursePage = lazy(
  () => import("@/features/courses/pages/CreateCoursePage"),
);
const AllCoursesPage = lazy(
  () => import("@/features/courses/pages/AllCoursesPage"),
);
const AllClassesPage = lazy(
  () => import("@/features/courses/pages/AllClassesPage"),
);
const CreateClassPage = lazy(
  () => import("@/features/courses/pages/CreateClassPage"),
);
const ClassDetailPage = lazy(
  () => import("@/features/courses/pages/ClassDetailPage"),
);
const CourseDetailPage = lazy(
  () => import("@/features/courses/pages/CourseDetailPage"),
);
const StudentClassDetailPage = lazy(
  () => import("@/features/courses/pages/StudentClassDetailPage"),
);
const StudentCourseDetailPage = lazy(
  () => import("@/features/courses/pages/StudentCourseDetailPage"),
);
const SchedulePage = lazy(
  () => import("@/features/courses/pages/SchedulePage"),
);
const CreateAssignmentPage = lazy(
  () => import("@/features/courses/pages/CreateAssignmentPage"),
);

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
          {
            path: "checkout",
            element: (
              <AuthGuard>
                <LazyRoute>
                  <CheckoutPage />
                </LazyRoute>
              </AuthGuard>
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
                    path: "news/:slug",
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
                    children: [
                      {
                        path: ":id",
                        element: (
                          <LazyRoute>
                            <ReelDetailPage />
                          </LazyRoute>
                        ),
                      },
                    ],
                  },
                  {
                    path: "letters",
                    element: <MailPage />,
                  },
                  {
                    path: "calendar",
                    element: <CalendarPage />,
                  },
                  {
                    path: "calendar/create",
                    element: <CreateEventPage />,
                  },
                  {
                    path: "website/:id",
                    element: (
                      <AuthGuard>
                        <WebsitePage />
                      </AuthGuard>
                    ),
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
            <MainLayout showFooter={false} />
          </AuthGuard>
        ),
        children: [
          {
            element: <WorkspaceLayout />,
            children: [
              {
                index: true,
                element: <WorkspaceCourseRedirect />,
              },
              {
                path: "courses",
                element: (
                  <LazyRoute>
                    <MyCoursesPage />
                  </LazyRoute>
                ),
              },
              {
                path: "courses/all",
                element: (
                  <LazyRoute>
                    <AllCoursesPage />
                  </LazyRoute>
                ),
              },
              {
                path: "courses/all-classes",
                element: (
                  <LazyRoute>
                    <AllClassesPage />
                  </LazyRoute>
                ),
              },
              {
                path: "courses/create",
                element: (
                  <LazyRoute>
                    <CreateCoursePage />
                  </LazyRoute>
                ),
              },
              {
                path: "courses/edit/:id",
                element: (
                  <LazyRoute>
                    <CreateCoursePage />
                  </LazyRoute>
                ),
              },
              {
                path: "courses/create-class",
                element: (
                  <LazyRoute>
                    <CreateClassPage />
                  </LazyRoute>
                ),
              },
              {
                path: "courses/edit-class/:id",
                element: (
                  <LazyRoute>
                    <CreateClassPage />
                  </LazyRoute>
                ),
              },
              {
                path: "courses/schedule",
                element: (
                  <LazyRoute>
                    <SchedulePage />
                  </LazyRoute>
                ),
              },
              {
                path: "courses/class/:id",
                element: (
                  <LazyRoute>
                    <ClassDetailPage />
                  </LazyRoute>
                ),
              },
              {
                path: "courses/class/:id/create-assignment",
                element: (
                  <LazyRoute>
                    <CreateAssignmentPage />
                  </LazyRoute>
                ),
              },
              {
                path: "courses/details/:id",
                element: (
                  <LazyRoute>
                    <CourseDetailPage />
                  </LazyRoute>
                ),
              },
              {
                path: "learning",
                element: (
                  <LazyRoute>
                    <MyLearningPage />
                  </LazyRoute>
                ),
              },
              {
                path: "learning/details/:id",
                element: (
                  <LazyRoute>
                    <StudentCourseDetailPage />
                  </LazyRoute>
                ),
              },
              {
                path: "learning/class/:id",
                element: (
                  <LazyRoute>
                    <StudentClassDetailPage />
                  </LazyRoute>
                ),
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
                children: [
                  {
                    path: ":id",
                    element: (
                      <LazyRoute>
                        <WorkspaceReelDetailPage />
                      </LazyRoute>
                    ),
                  },
                ],
              },
              {
                path: "events",
                element: (
                  <LazyRoute>
                    <WorkspaceEventsPage />
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
            path: "profile/:accountId?",
            element: (
              <LazyRoute>
                <Profile />
              </LazyRoute>
            ),
          },
          {
            element: <UserPagesLayout />,
            children: [
              {
                path: "setting",
                children: [
                  {
                    index: true,
                    element: <Navigate to="account" replace />,
                  },
                  {
                    path: "account",
                    element: (
                      <LazyRoute>
                        <AccountInfoPage />
                      </LazyRoute>
                    ),
                  },
                  {
                    path: "instructor",
                    element: (
                      <LazyRoute>
                        <InstructorPage />
                      </LazyRoute>
                    ),
                  },
                  {
                    path: "system",
                    element: (
                      <LazyRoute>
                        <SystemSettingsPage />
                      </LazyRoute>
                    ),
                  },
                ],
              },
              {
                path: "organization",
                element: (
                  <LazyRoute>
                    <OrganizationPage />
                  </LazyRoute>
                ),
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
        path: "/chat",
        element: (
          <AuthGuard>
            <MainLayout showFooter={false} />
          </AuthGuard>
        ),
        children: [
          {
            index: true,
            element: (
              <LazyRoute>
                <ChatPage />
              </LazyRoute>
            ),
          },
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
];

export default routesConfig;
