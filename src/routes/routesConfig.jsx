import { lazy } from "react";
import { MainLayout, VideoCallLayout } from "@layouts";

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
import GlobalNewsPage from "@/features/news/pages/GlobalNewsPage";
import NewsDetailPage from "@/features/news/pages/NewsDetailPage";
import DiscoverPage from "@/features/discover/DiscoverPage";
import MailPage from "@/features/mail/pages/MailPage";
import SharedEventPage from "@/features/calendar/pages/SharedEventPage";
import CalendarPage from "@/features/calendar/pages/CalendarPage";
import CreateEventPage from "@/features/calendar/pages/CreateEventPage";

// Shared Pages
import { PageNotFound, ForbiddenPage, ComingSoonPage } from "@/shared/pages";

// User & Admin Pages
import UserDashboard from "@/features/user/pages/UserDashboard";

import UserPagesLayout from "@/features/user/layouts/UserPagesLayout";
// Language routing components
import LanguageLayout from "./LanguageLayout";
import { LazyRoute, RootLayout, RootRoute } from "./RouteShells";

import { Navigate } from "react-router-dom";
import { AuthGuard, RoleGuard } from "@/shared/components";
import RouteErrorBoundary from "@/shared/components/RouteErrorBoundary";

import WorkspaceCourseRedirect from "@/features/courses/components/WorkspaceCourseRedirect";
import { WebsitePage, ResourcesHubPage } from "@/features/websites";
import BulletinBoardPage from "@/features/courses/components/lecture-hall/pages/BulletinBoardPage";
import PostDetailPage from "@/features/courses/components/lecture-hall/pages/PostDetailPage";
import CreatePostPage from "@/features/courses/components/lecture-hall/pages/CreatePostPage";
import LinkYoutubePage from "@/features/courses/components/lecture-hall/pages/LinkYoutubePage";
import MyCalendarPage from "@/features/calendar/pages/MyCalendarPage";

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
const RefundHistoryPage = lazy(() => import("@/features/refunds/pages/RefundHistoryPage.jsx"));
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
const ExploreCoursesPage = lazy(
  () => import("@/features/courses/pages/ExploreCoursesPage"),
);
const CreateCoursePage = lazy(
  () => import("@/features/courses/pages/CreateCoursePage"),
);
const AllCoursesPage = lazy(
  () => import("@/features/courses/pages/AllCoursesPage"),
);
const MyClassesPage = lazy(
  () => import("@/features/courses/pages/MyClassesPage"),
);
const WorkspaceAnalyticsPage = lazy(
  () => import("@/features/courses/components/WorkspaceAnalyticsPage"),
);
const WorkspaceDashboardPage = lazy(
  () => import("@/features/courses/components/WorkspaceDashboardPage"),
);
const CreateVoucherPage = lazy(
  () => import("@/features/vouchers/pages/CreateVoucherPage"),
);
const VoucherDetailPage = lazy(
  () => import("@/features/vouchers/pages/VoucherDetailPage"),
);
const WorkspaceCalendarPage = lazy(
  () => import("@/features/calendar/pages/WorkspaceCalendarPage"),
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
const PublicClassDetailPage = lazy(
  () => import("@/features/courses/pages/PublicClassDetailPage"),
);
const SchedulePage = lazy(
  () => import("@/features/courses/pages/SchedulePage"),
);
const CreateAssignmentPage = lazy(
  () => import("@/features/courses/pages/CreateAssignmentPage"),
);
const WorkspaceRoomsPage = lazy(
  () => import("@/features/rooms/pages/WorkspaceRoomsPage"),
);

const CreateExamPage = lazy(
  () => import("@/features/courses/pages/CreateExamPage"),
);
const TeachingMaterialPage = lazy(
  () => import("@/features/materials/pages/TeachingMaterialPage"),
);
const SharedMaterialRedirectPage = lazy(
  () => import("@/features/materials/pages/SharedMaterialRedirectPage"),
);
const StudentTakeQuizView = lazy(
  () => import("@/features/courses/components/grading/StudentTakeQuizView"),
);
const ReviewClassPage = lazy(
  () => import("@/features/courses/pages/ReviewClassPage"),
);

const routesConfig = [
  {
    // Root wrapper — registers navigate for global PiP provider
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
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
            path: "shared-material/:token",
            element: (
              <LazyRoute>
                <SharedMaterialRedirectPage />
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
          {
            path: "explore-courses",
            element: (
              <LazyRoute>
                <ExploreCoursesPage />
              </LazyRoute>
            ),
          },
          {
            path: "explore-courses/details/:id",
            element: (
              <LazyRoute>
                <StudentCourseDetailPage />
              </LazyRoute>
            ),
          },
          {
            path: "explore-courses/class/:id",
            element: (
              <LazyRoute>
                <PublicClassDetailPage />
              </LazyRoute>
            ),
          },
          {
            path: "resources",
            element: (
              <AuthGuard>
                <ResourcesHubPage />
              </AuthGuard>
            ),
          },
          {
            path: "resources/:id",
            element: (
              <AuthGuard>
                <WebsitePage />
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
                    path: "global-news",
                    element: <GlobalNewsPage />,
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
      {
        path: "/workspace/courses/class/:classId/quiz/:quizId/take",
        element: (
          <AuthGuard>
            <LazyRoute>
              <StudentTakeQuizView />
            </LazyRoute>
          </AuthGuard>
        ),
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
                path: "explore-courses",
                element: (
                  <LazyRoute>
                    <ExploreCoursesPage />
                  </LazyRoute>
                ),
              },
              {
                path: "explore-courses/details/:id",
                element: (
                  <LazyRoute>
                    <StudentCourseDetailPage />
                  </LazyRoute>
                ),
              },
              {
                path: "explore-courses/class/:id",
                element: (
                  <LazyRoute>
                    <PublicClassDetailPage />
                  </LazyRoute>
                ),
              },
              {
                path: "courses",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]}>
                    <LazyRoute>
                      <MyCoursesPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "classes",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]}>
                    <LazyRoute>
                      <MyClassesPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "my-calendar",
                element: (
                  <LazyRoute>
                    <MyCalendarPage />
                  </LazyRoute>
                )
              },
              {
                path: "teaching-tasks",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]}>
                    <LazyRoute>
                      <WorkspaceCalendarPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "materials",
                element: (
                  <LazyRoute>
                    <TeachingMaterialPage />
                  </LazyRoute>
                ),
              },
              {
                path: "materials/:folderId",
                element: (
                  <LazyRoute>
                    <TeachingMaterialPage />
                  </LazyRoute>
                ),
              },
              {
                path: "schedule",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]}>
                    <LazyRoute>
                      <SchedulePage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "analytics",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]}>
                    <LazyRoute>
                      <WorkspaceAnalyticsPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "dashboard",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]}>
                    <LazyRoute>
                      <WorkspaceDashboardPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "vouchers/create",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]}>
                    <LazyRoute>
                      <CreateVoucherPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "vouchers/edit/:id",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]}>
                    <LazyRoute>
                      <CreateVoucherPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "vouchers/:id",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]}>
                    <LazyRoute>
                      <VoucherDetailPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "vouchers/detail/:id",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]}>
                    <LazyRoute>
                      <VoucherDetailPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "courses/all",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]}>
                    <LazyRoute>
                      <AllCoursesPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "classes/all-classes",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]}>
                    <LazyRoute>
                      <AllClassesPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "courses/create",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]}>
                    <LazyRoute>
                      <CreateCoursePage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "courses/edit/:id",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]}>
                    <LazyRoute>
                      <CreateCoursePage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "classes/create-class",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]}>
                    <LazyRoute>
                      <CreateClassPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "courses/edit-class/:id",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]}>
                    <LazyRoute>
                      <CreateClassPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "courses/schedule",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]}>
                    <LazyRoute>
                      <SchedulePage />
                    </LazyRoute>
                  </RoleGuard>
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
                path: "courses/class/:id/bulletin-board/:boardId",
                element: (
                  <LazyRoute>
                    <BulletinBoardPage />
                  </LazyRoute>
                ),
              },
              {
                path: "courses/class/:id/bulletin-board/posts/:postId",
                element: (
                  <LazyRoute>
                    <PostDetailPage />
                  </LazyRoute>
                ),
              },
              {
                path: "courses/class/:id/bulletin-board/:boardId/create-post",
                element: (
                  <LazyRoute>
                    <CreatePostPage />
                  </LazyRoute>
                ),
              },
              {
                path: "courses/class/:id/bulletin-board/:boardId/edit-post/:postId",
                element: (
                  <LazyRoute>
                    <CreatePostPage />
                  </LazyRoute>
                ),
              },
              {
                path: "courses/class/:id/links/:itemId",
                element: (
                  <LazyRoute>
                    <LinkYoutubePage />
                  </LazyRoute>
                ),
              },
              {
                path: "courses/class/:id/assignment/:assignmentId",
                element: (
                  <LazyRoute>
                    <CreateAssignmentPage />
                  </LazyRoute>
                ),
              },
              {
                path: "courses/class/:id/assignment/:assignmentId/edit",
                element: (
                  <LazyRoute>
                    <CreateAssignmentPage />
                  </LazyRoute>
                ),
              },
              {
                path: "courses/class/:id/create-exam",
                element: (
                  <LazyRoute>
                    <CreateExamPage />
                  </LazyRoute>
                ),
              },
              {
                path: "courses/class/:id/quiz/:quizId",
                element: (
                  <LazyRoute>
                    <CreateExamPage />
                  </LazyRoute>
                ),
              },
              {
                path: "courses/class/:id/quiz/:quizId/submission/:studentId",
                element: (
                  <LazyRoute>
                    <CreateExamPage />
                  </LazyRoute>
                ),
              },
              {
                path: "courses/class/:id/quiz/:quizId/edit",
                element: (
                  <LazyRoute>
                    <CreateExamPage />
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
                path: "learning/class/:id/review",
                element: (
                  <LazyRoute>
                    <ReviewClassPage />
                  </LazyRoute>
                ),
              },
              {
                path: "learning/class/:id/bulletin-board/:boardId",
                element: (
                  <LazyRoute>
                    <BulletinBoardPage />
                  </LazyRoute>
                ),
              },
              {
                path: "learning/class/:id/bulletin-board/posts/:postId",
                element: (
                  <LazyRoute>
                    <PostDetailPage />
                  </LazyRoute>
                ),
              },
              {
                path: "learning/class/:id/bulletin-board/:boardId/create-post",
                element: (
                  <LazyRoute>
                    <CreatePostPage />
                  </LazyRoute>
                ),
              },
              {
                path: "learning/class/:id/bulletin-board/:boardId/edit-post/:postId",
                element: (
                  <LazyRoute>
                    <CreatePostPage />
                  </LazyRoute>
                ),
              },
              {
                path: "learning/class/:id/links/:itemId",
                element: (
                  <LazyRoute>
                    <LinkYoutubePage />
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
              {
                path: "events/create",
                element: <CreateEventPage />,
              },
              {
                path: "rooms",
                element: (
                  <LazyRoute>
                    <WorkspaceRoomsPage />
                  </LazyRoute>
                ),
              },
              {
                path: "profile/:accountId?",
                element: (
                  <LazyRoute>
                    <Profile />
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
                path: "pricing",
                element: (
                  <LazyRoute>
                    <PricingPage />
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
              {
                path: "refunds",
                element: <Navigate to="/billing?tab=refunds" replace />,
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
          {
            path: ":id",
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
