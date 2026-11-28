import { lazy } from "react"
import { MainLayout, VideoCallLayout } from "@layouts"

// Guest Pages
const PolicyPage = lazy(() => import("@/features/auth/pages/PolicyPage"))
const ResetPasswordPage = lazy(
  () => import("@/features/auth/pages/ResetPasswordPage"),
)
const VerifyEmailPage = lazy(
  () => import("@/features/auth/pages/VerifyEmailPage"),
)
const UnsubscribePage = lazy(
  () => import("@/features/settings/pages/UnsubscribePage"),
)
const VideoCallRoom = lazy(
  () => import("@/features/video-call/pages/VideoCallRoom"),
)
const QueuePage = lazy(() => import("@/features/queue/pages/QueuePage"))
const RoomsPage = lazy(() => import("@/features/rooms/pages/RoomsPage"))
const ContactPage = lazy(() => import("@/features/landing/pages/ContactPage"))

// Cat Speak Feature Pages
import CatSpeakLayout from "@/features/cat-speak/layouts/CatSpeakLayout"
const NewsPage = lazy(() => import("@/features/news/pages/NewsPage"))
const GlobalNewsPage = lazy(
  () => import("@/features/news/pages/GlobalNewsPage"),
)
const NewsDetailPage = lazy(
  () => import("@/features/news/pages/NewsDetailPage"),
)
const DiscoverPage = lazy(() => import("@/features/discover/DiscoverPage"))
const LettersPage = lazy(() => import("@/features/stories/pages/LettersPage.jsx"))
const SharedEventPage = lazy(
  () => import("@/features/calendar/pages/SharedEventPage"),
)
const CalendarPage = lazy(
  () => import("@/features/calendar/pages/CalendarPage"),
)
const CreateEventPage = lazy(
  () => import("@/features/calendar/pages/CreateEventPage"),
)
const GroupInvitePage = lazy(
  () => import("@/features/chat/pages/GroupInvitePage"),
)

// AI Tutor Feature Pages
import AiTutorLayout from "@/features/ai-tutor/layouts/AiTutorLayout"
// Nạp sẵn (không lazy): phải hiện được cả khi mất mạng không tải được module khác.
import AiFlashcardRouteError from "@/features/ai-tutor/components/flashcards/FlashcardRouteError"
const AiSpeakingRoomPage = lazy(
  () => import("@/features/ai-tutor/pages/SpeakingRoomPage"),
)
const SpeakingSessionPage = lazy(
  () => import("@/features/ai-tutor/pages/SpeakingSessionPage"),
)
const SpeakingResultPage = lazy(
  () => import("@/features/ai-tutor/pages/SpeakingResultPage"),
)
const SpeakingRoomFlowLayout = lazy(
  () => import("@/features/ai-tutor/layouts/SpeakingRoomFlowLayout"),
)
const AiSpeakingReportPage = lazy(
  () => import("@/features/ai-tutor/pages/SpeakingReportPage"),
)
const AiVocabularyNotebookPage = lazy(
  () => import("@/features/ai-tutor/pages/VocabularyNotebookPage"),
)
// TASK-AI-16: fc02 (phiên ôn) và fc03 (kết quả) của flashcard SRS
const AiFlashcardReviewPage = lazy(
  () => import("@/features/ai-tutor/pages/FlashcardReviewPage"),
)
const AiFlashcardResultPage = lazy(
  () => import("@/features/ai-tutor/pages/FlashcardResultPage"),
)
const AiDeckBrowsePage = lazy(
  () => import("@/features/ai-tutor/pages/DeckBrowsePage"),
)
const AiDeckListPage = lazy(
  () => import("@/features/ai-tutor/pages/DeckListPage"),
)
const AiAddFlashcardPage = lazy(
  () => import("@/features/ai-tutor/pages/AddFlashcardPage"),
)
const AiPronunciationPracticePage = lazy(
  () => import("@/features/ai-tutor/pages/PronunciationPracticePage"),
)
const AiFlashcardLayout = lazy(
  () => import("@/features/ai-tutor/layouts/FlashcardLayout"),
)
const AiHistoryProgressPage = lazy(
  () => import("@/features/ai-tutor/pages/HistoryProgressPage"),
)

// Shared Pages
import { PageNotFound, ForbiddenPage, ComingSoonPage } from "@/shared/pages"

// User & Admin Pages

import UserPagesLayout from "@/features/user/layouts/UserPagesLayout"
// Language routing components
import LanguageLayout from "./LanguageLayout"
import { LazyRoute, RootLayout, RootRoute, AiLevelAssessmentRoute, AuthRedirectRoute } from "./RouteShells"

import SettingIndexRedirect from "./SettingIndexRedirect"
import { Navigate } from "react-router-dom"
import { AuthGuard, CommunityGuard, RoleGuard } from "@/shared/components"
import RouteErrorBoundary from "@/shared/components/RouteErrorBoundary"

import WorkspaceCourseRedirect from "@/features/courses/components/WorkspaceCourseRedirect"
import ClassroomAccessGuard from "@/features/courses/components/ClassroomAccessGuard"
const WebsitePage = lazy(() =>
  import("@/features/websites").then((m) => ({ default: m.WebsitePage })),
)
const ResourcesHubPage = lazy(() =>
  import("@/features/websites").then((m) => ({ default: m.ResourcesHubPage })),
)
const BulletinBoardPage = lazy(
  () =>
    import("@/features/courses/components/lecture-hall/pages/BulletinBoardPage"),
)
const PostDetailPage = lazy(
  () =>
    import("@/features/courses/components/lecture-hall/pages/PostDetailPage"),
)
const CreatePostPage = lazy(
  () =>
    import("@/features/courses/components/lecture-hall/pages/CreatePostPage"),
)
const LinkYoutubePage = lazy(
  () =>
    import("@/features/courses/components/lecture-hall/pages/LinkYoutubePage"),
)
const MyCalendarPage = lazy(
  () => import("@/features/calendar/pages/MyCalendarPage"),
)

import ProfilePageSkeleton from "@/features/profile/components/ProfilePageSkeleton"
const PlacementSessionPage = lazy(
  () => import("@/features/placement-test/pages/PlacementSessionPage"),
)
const PlacementScoringPage = lazy(
  () => import("@/features/placement-test/pages/PlacementScoringPage"),
)
const PlacementResultPage = lazy(
  () => import("@/features/placement-test/pages/PlacementResultPage"),
)
const PlacementProfilePage = lazy(
  () => import("@/features/placement-test/pages/PlacementProfilePage"),
)
const ProfilePage = lazy(() => import("@/features/profile/pages/ProfilePage"))
const AccountInfoPage = lazy(
  () => import("@/features/settings/pages/AccountInfoPage"),
)
const RecordingsPage = lazy(
  () => import("@/features/recordings/pages/RecordingsPage"),
)
const WorkspaceLayout = lazy(
  () => import("@/features/workspace/layouts/WorkspaceLayout"),
)
const InstructorPage = lazy(
  () => import("@/features/user/pages/InstructorPage"),
)
const OrganizationPage = lazy(
  () => import("@/features/user/pages/OrganizationPage"),
)
const SystemSettingsPage = lazy(
  () => import("@/features/settings/pages/SystemSettingsPage"),
)

const ReelsPage = lazy(() => import("@/features/reels/ReelsPage"))
const ChatPage = lazy(() => import("@/features/chat/pages/ChatPage"))
const HelpCenterPage = lazy(
  () => import("@/features/help/pages/HelpCenterPage"),
)
const ReelDetailPage = lazy(
  () => import("@/features/reels/pages/ReelDetailPage"),
)
const WorkspaceReelsPage = lazy(
  () => import("@/features/reels/pages/WorkspaceReelsPage"),
)
const WorkspaceReelDetailPage = lazy(
  () => import("@/features/reels/pages/WorkspaceReelDetailPage"),
)

const WorkspaceEventsPage = lazy(
  () => import("@/features/calendar/pages/WorkspaceEventsPage"),
)
const BillingFeature = lazy(() => import("@/features/billing/index.jsx"))
const RefundHistoryPage = lazy(
  () => import("@/features/refunds/pages/RefundHistoryPage.jsx"),
)
const MyLearningPage = lazy(
  () => import("@/features/courses/pages/MyLearningPage"),
)
const PaymentResultPage = lazy(
  () => import("@/features/billing/pages/PaymentResultPage.jsx"),
)
const PricingPage = lazy(
  () => import("@/features/billing/pages/PricingPage.jsx"),
)
const CheckoutPage = lazy(
  () => import("@/features/billing/pages/CheckoutPage.jsx"),
)
const CheckoutClassPage = lazy(
  () => import("@/features/billing/pages/CheckoutClassPage.jsx"),
)
const MyCoursesPage = lazy(
  () => import("@/features/courses/pages/MyCoursesPage"),
)
const ExploreCoursesPage = lazy(
  () => import("@/features/courses/pages/ExploreCoursesPage"),
)
const TeacherPublicProfilePage = lazy(
  () => import("@/features/courses/pages/TeacherPublicProfilePage"),
)
const TeacherCompetencyPage = lazy(
  () => import("@/features/courses/pages/TeacherCompetencyPage"),
)
const CreateCoursePage = lazy(
  () => import("@/features/courses/pages/CreateCoursePage"),
)
const AllCoursesPage = lazy(
  () => import("@/features/courses/pages/AllCoursesPage"),
)
const MyClassesPage = lazy(
  () => import("@/features/courses/pages/MyClassesPage"),
)
const WorkspaceAnalyticsPage = lazy(
  () => import("@/features/courses/components/WorkspaceAnalyticsPage"),
)
const ClassAnalyticsDetailPage = lazy(
  () => import("@/features/courses/pages/ClassAnalyticsDetailPage"),
)
const StudentAnalyticsDetailPage = lazy(
  () => import("@/features/courses/pages/StudentAnalyticsDetailPage"),
)
const SessionAnalyticsDetailPage = lazy(
  () => import("@/features/courses/pages/SessionAnalyticsDetailPage"),
)
const WorkspaceDashboardPage = lazy(
  () => import("@/features/courses/components/WorkspaceDashboardPage"),
)
const WorkspaceDashboardRouter = lazy(
  () =>
    import("@/features/workspace/components/learner-dashboard/WorkspaceDashboardRouter"),
)
const LearnerDashboardPage = lazy(
  () =>
    import("@/features/workspace/components/learner-dashboard/LearnerDashboardPage"),
)
const CreateVoucherPage = lazy(
  () => import("@/features/vouchers/pages/CreateVoucherPage"),
)
const VoucherDetailPage = lazy(
  () => import("@/features/vouchers/pages/VoucherDetailPage"),
)
const TeacherVouchersPage = lazy(
  () => import("@/features/vouchers/pages/TeacherVouchersPage"),
)
const PointsAndOffersPage = lazy(
  () => import("@/features/points-and-offers/pages/PointsAndOffersPage"),
)
const WorkspaceCalendarPage = lazy(
  () => import("@/features/calendar/pages/WorkspaceCalendarPage"),
)
const AllTeachingTasksPage = lazy(
  () => import("@/features/courses/pages/AllTeachingTasksPage"),
)
const AllClassesPage = lazy(
  () => import("@/features/courses/pages/AllClassesPage"),
)
const CreateClassPage = lazy(
  () => import("@/features/courses/pages/CreateClassPage"),
)
const ClassDetailPage = lazy(
  () => import("@/features/courses/pages/ClassDetailPage"),
)
const CourseDetailPage = lazy(
  () => import("@/features/courses/pages/CourseDetailPage"),
)
const StudentClassDetailPage = lazy(
  () => import("@/features/courses/pages/StudentClassDetailPage"),
)
const StudentCourseDetailPage = lazy(
  () => import("@/features/courses/pages/StudentCourseDetailPage"),
)
const PublicClassDetailPage = lazy(
  () => import("@/features/courses/pages/PublicClassDetailPage"),
)
const SchedulePage = lazy(() => import("@/features/courses/pages/SchedulePage"))
const CreateAssignmentPage = lazy(
  () => import("@/features/courses/pages/CreateAssignmentPage"),
)
const WorkspaceRoomsPage = lazy(
  () => import("@/features/rooms/pages/WorkspaceRoomsPage"),
)

const CreateExamPage = lazy(
  () => import("@/features/courses/pages/CreateExamPage"),
)
const TeachingMaterialPage = lazy(
  () => import("@/features/materials/pages/TeachingMaterialPage"),
)
const SharedMaterialRedirectPage = lazy(
  () => import("@/features/materials/pages/SharedMaterialRedirectPage"),
)
const StudentTakeQuizView = lazy(
  () => import("@/features/courses/components/grading/StudentTakeQuizView"),
)
const ReviewClassPage = lazy(
  () => import("@/features/courses/pages/ReviewClassPage"),
)
const VocabularyNotebookPage = lazy(
  () => import("@/features/interactive-script/pages/VocabularyNotebookPage"),
)
const LearningPathCalendarPage = lazy(
  () => import("@/features/learning-path/pages/LearningPathCalendarPage"),
)

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
            path: "login",
            element: <AuthRedirectRoute mode="login" />,
          },
          {
            path: "register",
            element: <AuthRedirectRoute mode="register" />,
          },
          {
            path: "reset-password",
            element: (
              <LazyRoute>
                <ResetPasswordPage />
              </LazyRoute>
            ),
          },
          {
            path: "verify-email",
            element: (
              <LazyRoute>
                <VerifyEmailPage />
              </LazyRoute>
            ),
          },
          {
            path: "unsubscribe",
            element: (
              <LazyRoute>
                <UnsubscribePage />
              </LazyRoute>
            ),
          },
          {
            path: "contact",
            element: (
              <LazyRoute>
                <ContactPage />
              </LazyRoute>
            ),
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
            path: "points-and-offers",
            element: <Navigate to="/workspace/points-and-offers" replace />,
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
            path: "explore/teachers/:slugOrId",
            element: (
              <LazyRoute>
                <TeacherPublicProfilePage />
              </LazyRoute>
            ),
          },
          {
            path: "explore-courses/teachers/:slugOrId",
            element: (
              <LazyRoute>
                <TeacherPublicProfilePage />
              </LazyRoute>
            ),
          },
          {
            path: "explore/teachers/:slugOrId/competency",
            element: (
              <LazyRoute>
                <TeacherCompetencyPage />
              </LazyRoute>
            ),
          },
          {
            path: "explore-courses/teachers/:slugOrId/competency",
            element: (
              <LazyRoute>
                <TeacherCompetencyPage />
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
            path: "explore-courses/class/:id/checkout",
            element: (
              <AuthGuard>
                <LazyRoute>
                  <CheckoutClassPage />
                </LazyRoute>
              </AuthGuard>
            ),
          },
          {
            path: "resources",
            element: (
              <LazyRoute>
                <ResourcesHubPage />
              </LazyRoute>
            ),
          },
          {
            path: "resources/:id",
            element: (
              <LazyRoute>
                <WebsitePage />
              </LazyRoute>
            ),
          },
          {
            path: "help",
            element: (
              <LazyRoute>
                <HelpCenterPage />
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
                element: (
                  <LazyRoute>
                    <RoomsPage />
                  </LazyRoute>
                ),
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
                    element: (
                      <LazyRoute>
                        <NewsPage />
                      </LazyRoute>
                    ),
                  },
                  {
                    path: "global-news",
                    element: (
                      <LazyRoute>
                        <GlobalNewsPage />
                      </LazyRoute>
                    ),
                  },
                  {
                    path: "news/:slug",
                    element: (
                      <LazyRoute>
                        <NewsDetailPage />
                      </LazyRoute>
                    ),
                  },
                  {
                    path: "discover",
                    element: (
                      <LazyRoute>
                        <DiscoverPage />
                      </LazyRoute>
                    ),
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
                    element: (
                      <LazyRoute>
                        <LettersPage />
                      </LazyRoute>
                    ),
                  },
                  {
                    path: "calendar",
                    element: (
                      <LazyRoute>
                        <CalendarPage />
                      </LazyRoute>
                    ),
                  },
                  {
                    path: "calendar/create",
                    element: (
                      <AuthGuard>
                        <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                          <LazyRoute>
                            <CreateEventPage />
                          </LazyRoute>
                        </RoleGuard>
                      </AuthGuard>
                    ),
                  },
                  {
                    path: "learning-path",
                    element: (
                      <LazyRoute>
                        <LearningPathCalendarPage />
                      </LazyRoute>
                    ),
                  },
                  {
                    path: "placement-test",
                    element: (
                      <Navigate to="/zh/ai-tutor/level-assessment" replace />
                    ),
                  },
                  { path: "*", element: <PageNotFound /> },
                ],
              },
            ],
          },
        ],
      },

      // Language-prefixed ai-tutor routes
      {
        path: "/:lang/ai-tutor",
        element: <LanguageLayout />,
        children: [
          {
            element: <MainLayout />,
            children: [
              {
                element: <AiTutorLayout />,
                children: [
                  {
                    index: true,
                    element: <Navigate to="learning-path" replace />,
                  },
                  {
                    path: "level-assessment",
                    element: <AiLevelAssessmentRoute />,
                  },
                  {
                    path: "level-assessment/session",
                    element: (
                      <CommunityGuard>
                        <AuthGuard>
                          <LazyRoute>
                            <PlacementSessionPage />
                          </LazyRoute>
                        </AuthGuard>
                      </CommunityGuard>
                    ),
                  },
                  {
                    path: "level-assessment/scoring",
                    element: (
                      <CommunityGuard>
                        <AuthGuard>
                          <LazyRoute>
                            <PlacementScoringPage />
                          </LazyRoute>
                        </AuthGuard>
                      </CommunityGuard>
                    ),
                  },
                  {
                    path: "level-assessment/result",
                    element: (
                      <CommunityGuard>
                        <AuthGuard>
                          <LazyRoute>
                            <PlacementResultPage />
                          </LazyRoute>
                        </AuthGuard>
                      </CommunityGuard>
                    ),
                  },
                  {
                    path: "level-assessment/profile",
                    element: (
                      <CommunityGuard>
                        <AuthGuard>
                          <LazyRoute>
                            <PlacementProfilePage />
                          </LazyRoute>
                        </AuthGuard>
                      </CommunityGuard>
                    ),
                  },
                  {
                    path: "learning-path",
                    element: (
                      <LazyRoute>
                        <LearningPathCalendarPage />
                      </LazyRoute>
                    ),
                  },
                  {
                    path: "speaking-room",
                    element: (
                      <LazyRoute>
                        <SpeakingRoomFlowLayout />
                      </LazyRoute>
                    ),
                    children: [
                      {
                        index: true,
                        element: (
                          <LazyRoute>
                            <AiSpeakingRoomPage />
                          </LazyRoute>
                        ),
                      },
                      {
                        path: "sessions/:sessionId",
                        element: (
                          <LazyRoute>
                            <SpeakingSessionPage />
                          </LazyRoute>
                        ),
                      },
                      {
                        path: "sessions/:sessionId/result",
                        element: (
                          <LazyRoute>
                            <SpeakingResultPage />
                          </LazyRoute>
                        ),
                      },
                    ],
                  },
                  {
                    // TASK-AI-15: ss10 → ss11 (+ ss12, ss13) của một buổi nói
                    path: "speaking-room/report/:sessionId",
                    element: (
                      <LazyRoute>
                        <AiSpeakingReportPage />
                      </LazyRoute>
                    ),
                  },
                  {
                    // TASK-AI-16: Sổ tay từ vựng (flashcard). Cho phép xem tổng quan sổ thẻ,
                    // chặn AuthGuard ở các hành động ôn bài, thêm thẻ, phát âm.
                    path: "vocabulary-notebook",
                    element: (
                      <LazyRoute>
                        <AiFlashcardLayout />
                      </LazyRoute>
                    ),
                    errorElement: <AiFlashcardRouteError />,
                    children: [
                      {
                        index: true,
                        element: (
                          <LazyRoute>
                            <AiVocabularyNotebookPage />
                          </LazyRoute>
                        ),
                      },
                      {
                        path: "review",
                        element: (
                          <AuthGuard>
                            <LazyRoute>
                              <AiFlashcardReviewPage />
                            </LazyRoute>
                          </AuthGuard>
                        ),
                      },
                      {
                        path: "review/:sessionId/result",
                        element: (
                          <AuthGuard>
                            <LazyRoute>
                              <AiFlashcardResultPage />
                            </LazyRoute>
                          </AuthGuard>
                        ),
                      },
                      {
                        path: "decks",
                        element: (
                          <LazyRoute>
                            <AiDeckListPage />
                          </LazyRoute>
                        ),
                      },
                      {
                        path: "decks/:deckId",
                        element: (
                          <LazyRoute>
                            <AiDeckBrowsePage />
                          </LazyRoute>
                        ),
                      },
                      {
                        path: "add",
                        element: (
                          <AuthGuard>
                            <LazyRoute>
                              <AiAddFlashcardPage />
                            </LazyRoute>
                          </AuthGuard>
                        ),
                      },
                      {
                        path: "practice",
                        element: (
                          <AuthGuard>
                            <LazyRoute>
                              <AiPronunciationPracticePage />
                            </LazyRoute>
                          </AuthGuard>
                        ),
                      },
                    ],
                  },
                  {
                    path: "history-progress",
                    element: (
                      <LazyRoute>
                        <AiHistoryProgressPage />
                      </LazyRoute>
                    ),
                  },
                  { path: "*", element: <PageNotFound /> },
                ],
              },
            ],
          },
        ],
      },

      // Language-prefixed learning-path route (backward compatibility)
      {
        path: "/:lang/learning-path",
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
                    element: (
                      <LazyRoute>
                        <LearningPathCalendarPage />
                      </LazyRoute>
                    ),
                  },
                ],
              },
              { path: "*", element: <PageNotFound /> },
            ],
          },
        ],
      },

      // Language-prefixed pricing redirect
      {
        path: "/:lang/pricing",
        element: <Navigate to="/pricing" replace />,
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
                    <LazyRoute>
                      <VideoCallRoom />
                    </LazyRoute>
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
        element: (
          <LazyRoute>
            <PolicyPage />
          </LazyRoute>
        ),
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
            element: <Navigate to="/workspace/dashboard" replace />,
          },
          {
            path: "app/*",
            element: <Navigate to="/workspace/dashboard" replace />,
          },
        ],
      },
      {
        path: "/workspace/courses/class/:classId/quiz/:quizId/take",
        element: (
          <AuthGuard>
            <ClassroomAccessGuard>
              <LazyRoute>
                <StudentTakeQuizView />
              </LazyRoute>
            </ClassroomAccessGuard>
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
                path: "explore/teachers/:slugOrId",
                element: (
                  <LazyRoute>
                    <TeacherPublicProfilePage />
                  </LazyRoute>
                ),
              },
              {
                path: "explore-courses/teachers/:slugOrId",
                element: (
                  <LazyRoute>
                    <TeacherPublicProfilePage />
                  </LazyRoute>
                ),
              },
              {
                path: "explore/teachers/:slugOrId/competency",
                element: (
                  <LazyRoute>
                    <TeacherCompetencyPage />
                  </LazyRoute>
                ),
              },
              {
                path: "explore-courses/teachers/:slugOrId/competency",
                element: (
                  <LazyRoute>
                    <TeacherCompetencyPage />
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
                path: "explore-courses/class/:id/checkout",
                element: (
                  <AuthGuard>
                    <LazyRoute>
                      <CheckoutClassPage />
                    </LazyRoute>
                  </AuthGuard>
                ),
              },
              {
                path: "courses",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <MyCoursesPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "classes",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <MyClassesPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "classes/my",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <Navigate to="/workspace/classes" replace />
                  </RoleGuard>
                ),
              },
              {
                path: "classes/edit-class/:id",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <CreateClassPage />
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
                ),
              },
              {
                path: "vocabulary",
                element: (
                  <LazyRoute>
                    <VocabularyNotebookPage />
                  </LazyRoute>
                ),
              },
              {
                path: "teaching-tasks",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <AllTeachingTasksPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "teaching-tasks/overview",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <WorkspaceCalendarPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "materials",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <TeachingMaterialPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "materials/:folderId",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <TeachingMaterialPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "schedule",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <SchedulePage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "analytics",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <WorkspaceAnalyticsPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "analytics/class/:classId",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <ClassAnalyticsDetailPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "analytics/class/:classId/student/:studentId",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <StudentAnalyticsDetailPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "analytics/class/:classId/session/:sessionId",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <SessionAnalyticsDetailPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "dashboard",
                element: (
                  <LazyRoute>
                    <WorkspaceDashboardRouter />
                  </LazyRoute>
                ),
              },
              {
                path: "learner-dashboard",
                element: (
                  <LazyRoute>
                    <LearnerDashboardPage />
                  </LazyRoute>
                ),
              },
              {
                path: "vouchers",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <TeacherVouchersPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "vouchers/create",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <CreateVoucherPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "vouchers/edit/:id",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <CreateVoucherPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "vouchers/:id",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <VoucherDetailPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "vouchers/detail/:id",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <VoucherDetailPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "courses/all",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <AllCoursesPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "classes/all-classes",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <AllClassesPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "courses/create",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <CreateCoursePage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "courses/edit/:id",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <CreateCoursePage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "classes/create-class",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <CreateClassPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "courses/edit-class/:id",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <CreateClassPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "courses/schedule",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <SchedulePage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                element: <ClassroomAccessGuard instructorView />,
                children: [
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
                ],
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
                element: <ClassroomAccessGuard />,
                children: [
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
                ],
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
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <WorkspaceEventsPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
              },
              {
                path: "events/create",
                element: (
                  <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
                    <LazyRoute>
                      <CreateEventPage />
                    </LazyRoute>
                  </RoleGuard>
                ),
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
                  <LazyRoute fallback={<ProfilePageSkeleton />}>
                    <ProfilePage />
                  </LazyRoute>
                ),
              },
              {
                path: "points-and-offers",
                element: (
                  <LazyRoute>
                    <PointsAndOffersPage />
                  </LazyRoute>
                ),
              },
              {
                path: "bonus-points",
                element: <Navigate to="/workspace/points-and-offers" replace />,
              },
              {
                path: "voucher-exchange",
                element: <Navigate to="/workspace/points-and-offers" replace />,
              },
              { path: "*", element: <PageNotFound /> },
            ],
          },
        ],
      },

      {
        element: <MainLayout showFooter={false} />,
        children: [
          {
            element: <UserPagesLayout />,
            children: [
              {
                path: "setting",
                children: [
                  {
                    index: true,
                    element: <SettingIndexRedirect />,
                  },
                  {
                    path: "account",
                    element: (
                      <AuthGuard>
                        <RoleGuard
                          allowedRoles={["Student", "Admin"]}
                          fallbackPath="/setting/system"
                        >
                          <LazyRoute>
                            <AccountInfoPage />
                          </LazyRoute>
                        </RoleGuard>
                      </AuthGuard>
                    ),
                  },
                  {
                    path: "instructor",
                    element: (
                      <AuthGuard>
                        <LazyRoute>
                          <InstructorPage />
                        </LazyRoute>
                      </AuthGuard>
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
                  <AuthGuard>
                    <LazyRoute>
                      <OrganizationPage />
                    </LazyRoute>
                  </AuthGuard>
                ),
              },
              {
                path: "billing",
                element: (
                  <AuthGuard>
                    <LazyRoute>
                      <BillingFeature />
                    </LazyRoute>
                  </AuthGuard>
                ),
              },
              {
                path: "billing/result",
                element: (
                  <AuthGuard>
                    <LazyRoute>
                      <PaymentResultPage />
                    </LazyRoute>
                  </AuthGuard>
                ),
              },
              {
                path: "refunds",
                element: (
                  <AuthGuard>
                    <Navigate to="/billing?tab=refunds" replace />
                  </AuthGuard>
                ),
              },
              { path: "*", element: <PageNotFound /> },
            ],
          },
        ],
      },

      {
        path: "pricing",
        element: (
          <MainLayout
            showHeader={false}
            showSidebar={false}
            showFooter={false}
          />
        ),
        children: [
          {
            index: true,
            element: (
              <LazyRoute>
                <PricingPage />
              </LazyRoute>
            ),
          },
        ],
      },

      {
        path: "/queue",
        element: (
          <AuthGuard>
            <LazyRoute>
              <QueuePage />
            </LazyRoute>
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
        path: "/invite/:code",
        element: (
          <LazyRoute>
            <GroupInvitePage />
          </LazyRoute>
        ),
      },
      {
        path: "/chat/invite/:code",
        element: (
          <LazyRoute>
            <GroupInvitePage />
          </LazyRoute>
        ),
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
            element: (
              <LazyRoute>
                <SharedEventPage />
              </LazyRoute>
            ),
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
