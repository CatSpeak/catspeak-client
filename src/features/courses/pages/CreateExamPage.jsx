import React, {
  useState,
  useRef,
  useEffect,
  useReducer,
  useCallback,
  useMemo,
} from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useTimezone } from "@/shared/hooks/useTimezone";
import { toast } from "react-hot-toast";
import {
  useGetClassDetailQuery,
  useCreateTeacherQuizMutation,
  useGetTeacherQuizDetailQuery,
  useUpdateTeacherQuizMutation,
  usePublishTeacherQuizMutation,
  useDownloadQuizTemplateMutation,
  useImportTeacherQuestionsPreviewMutation,
} from "@/store/api/coursesApi";
import { LoadingSpinner } from "@/shared/components/ui/indicators";
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb";
import { DatePicker, Switch } from "@/shared/components/ui/inputs";
import RenderHTML from "@/shared/components/ui/RenderHTML";
import { IconButton } from "@/shared/components/ui/buttons";
import {
  buildQuizPayload,
  buildQuizUpdatePayload,
  createInitialQuizForm,
  getQuizErrorMessage,
  getQuizObjectFromResponse,
  mapQuizToFormState,
  validateQuizForm,
} from "@/features/courses/utils/quizUtils";
import {
  duplicateQuestion,
  moveQuestion,
  reorderQuestion,
} from "@/features/courses/utils/questionListOps";
import { Editor } from "@tinymce/tinymce-react";
import TeacherQuizDetailView from "@/features/courses/components/grading/TeacherQuizDetailView";
import ImportExcelInstructionModal from "@/features/courses/components/grading/ImportExcelInstructionModal";
import QuestionCard from "@/features/courses/components/grading/QuestionCard";
import {
  Plus,
  ChevronDown,
  Eye,
  Timer,
  LayoutGrid,
  ArrowLeft,
  ArrowRight,
  Flag,
  Music as MusicIcon,
  Info,
} from "lucide-react";

const CLOSED_QUIZ_RESTRICTED_FIELDS = new Set([
  "openTime",
  "closeTime",
  "allowLateSubmission",
  "timeLimitMinutes",
  "questions",
  "gradingScale",
  "resultReleaseMode",
]);

const getValidationMessage = (validation, ce, form = null) => {
  const firstError = validation?.errors?.[0];
  if (!firstError) {
    return (
      ce?.validation?.invalidForm ||
      "Quiz information is invalid. Please double check."
    );
  }

  const code = firstError.code;
  let template = ce?.validation?.[code] || firstError.message;

  if (template) {
    if (code === "QuizInvalidTotalScore" && form) {
      const scaleChoice = form.scoreScale || form.gradingScale;
      const targetScore =
        scaleChoice === "scale100" || scaleChoice === "Hundred" ? 100 : 10;
      const totalPoints = (form.questions || []).reduce((sum, q) => {
        const p = Number(q?.score ?? q?.points);
        return sum + (Number.isFinite(p) ? p : 0);
      }, 0);
      const roundedTotal = Math.round(totalPoints * 100) / 100;
      template = template
        .replace("{{actual}}", roundedTotal)
        .replace("{{expected}}", targetScore)
        .replace("{{scale}}", targetScore);
    } else {
      if (firstError.actualTotal !== undefined) {
        template = template.replace("{{actual}}", firstError.actualTotal);
      }
      if (firstError.expectedTotal !== undefined) {
        template = template.replace("{{expected}}", firstError.expectedTotal);
      }
      if (firstError.scale !== undefined) {
        template = template.replace("{{scale}}", firstError.scale);
      }
    }

    if (firstError.questionIndex !== undefined) {
      template = template.replace(
        "{{questionNumber}}",
        firstError.questionIndex + 1,
      );
    }
    return template;
  }

  return (
    ce?.validation?.invalidForm ||
    "Quiz information is invalid. Please double check."
  );
};

const createUnexpectedResponseError = () => {
  const error = new Error("Unexpected quiz response");
  error.code = "QuizInvalidResponse";
  return error;
};

const formReducer = (state, action) => {
  switch (action.type) {
    case "SET_FIELD": {
      const currentValue = state[action.field];
      const nextValue =
        typeof action.value === "function"
          ? action.value(currentValue)
          : action.value;

      if (Object.is(currentValue, nextValue)) return state;

      return {
        ...state,
        [action.field]: nextValue,
      };
    }

    case "HYDRATE":
      return action.payload;

    case "RESET":
      return createInitialQuizForm();

    default:
      return state;
  }
};

const SettingToggleRow = ({
  label,
  checked,
  onChange,
  ariaLabel,
  disabled = false,
}) => (
  <div className="flex justify-between items-center gap-3">
    <span className="text-xs font-semibold text-gray-700">{label}</span>
    <Switch
      checked={Boolean(checked)}
      onChange={onChange}
      disabled={disabled}
      colorClass="peer-checked:bg-[#990011]"
      size="sm"
      aria-label={ariaLabel || label}
    />
  </div>
);

const CreateExamForm = ({ id, classData, language, t }) => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isImportingMode, setIsImportingMode] = useState(false);
  const importFileInputRef = useRef(null);
  const routeQuizId = params.quizId || searchParams.get("quizId");
  const [createdQuizId, setCreatedQuizId] = useState(null);
  const effectiveQuizId = routeQuizId || createdQuizId;

  const isEditPath =
    location.pathname.endsWith("/edit") || searchParams.get("mode") === "edit";
  const initialViewMode = isEditPath || !effectiveQuizId ? "edit" : "detail";
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [isExcelInstructionOpen, setIsExcelInstructionOpen] = useState(false);

  // Redirect legacy /create-exam?quizId=4 to clean route /quiz/4
  useEffect(() => {
    if (effectiveQuizId && location.pathname.includes("/create-exam")) {
      const cleanPath = isEditPath
        ? `/workspace/courses/class/${encodeURIComponent(id)}/quiz/${encodeURIComponent(effectiveQuizId)}/edit`
        : `/workspace/courses/class/${encodeURIComponent(id)}/quiz/${encodeURIComponent(effectiveQuizId)}`;
      navigate(cleanPath, { replace: true });
    }
  }, [effectiveQuizId, location.pathname, isEditPath, id, navigate]);

  useEffect(() => {
    if (isEditPath) {
      setViewMode("edit");
    } else if (effectiveQuizId && !isImportingMode) {
      setViewMode("detail");
    }
  }, [isEditPath, effectiveQuizId, isImportingMode]);

  const {
    currentData: quizDetailResponse,
    error: quizDetailError,
    isError: isQuizError,
    isLoading: isQuizLoading,
    isFetching: isQuizFetching,
    refetch: refetchQuiz,
  } = useGetTeacherQuizDetailQuery(
    { classId: id, quizId: effectiveQuizId },
    { skip: !id || !effectiveQuizId },
  );
  const quizDetail = getQuizObjectFromResponse(quizDetailResponse);
  const hasMalformedQuizResponse = Boolean(
    effectiveQuizId &&
    quizDetailResponse !== undefined &&
    quizDetailResponse !== null &&
    !quizDetail,
  );

  const [createTeacherQuiz, { isLoading: isCreating }] =
    useCreateTeacherQuizMutation();
  const [updateTeacherQuiz, { isLoading: isUpdating }] =
    useUpdateTeacherQuizMutation();
  const [publishTeacherQuiz, { isLoading: isPublishing }] =
    usePublishTeacherQuizMutation();
  const [downloadQuizTemplate, { isLoading: isDownloadingTemplate }] =
    useDownloadQuizTemplateMutation();
  const [importTeacherQuestionsPreview, { isLoading: isImporting }] =
    useImportTeacherQuestionsPreviewMutation();
  const [isActionPending, setIsActionPending] = useState(false);
  const isSubmitting =
    isActionPending || isCreating || isUpdating || isPublishing;
  const submissionGuardRef = useRef(false);

  const { userTimeZone } = useTimezone();
  const c = useMemo(() => t.courses || {}, [t]);
  const ce = useMemo(() => c.createExam || {}, [c]);

  // Persisted quiz form state
  const [form, dispatchForm] = useReducer(
    formReducer,
    undefined,
    createInitialQuizForm,
  );

  const {
    title,
    editorText,
    openDate,
    closeDate,
    questions,
    duration,
    maxAttempts,
    allowLateSubmission,
    passPercent,
    shuffleQuestions,
    shuffleOptions,
    showAnswers,
    autoGrading,
    scoreScale,
    resultRelease,
    publishStatus,
    postToFeed,
  } = form;

  const setFormField = useCallback((field, value) => {
    dispatchForm({ type: "SET_FIELD", field, value });
  }, []);

  // Drag states
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [draggableIndex, setDraggableIndex] = useState(null);
  // Mirrors draggedIndex so the drag handlers can stay referentially stable.
  const draggedIndexRef = useRef(null);
  const setDraggedIndexStable = useCallback((value) => {
    draggedIndexRef.current = value;
    setDraggedIndex(value);
  }, []);
  const lastScrollTimeRef = useRef(0);
  const [importedFileName, setImportedFileName] = useState(null);

  // Collapse state
  const [collapsedQuestions, setCollapsedQuestions] = useState({});

  const toggleCollapse = useCallback((qId) => {
    setCollapsedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  }, []);

  // Preview Mode states
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewCurrentIndex, setPreviewCurrentIndex] = useState(0);
  const [previewAnswers, setPreviewAnswers] = useState({});
  const [previewFlagged, setPreviewFlagged] = useState({});
  const [previewTimeRemaining, setPreviewTimeRemaining] = useState(0);

  const populatedQuizIdRef = useRef(null);
  const baselineFormRef = useRef(createInitialQuizForm());
  const previousRouteQuizIdRef = useRef(routeQuizId);

  useEffect(() => {
    const previousRouteQuizId = previousRouteQuizIdRef.current;
    previousRouteQuizIdRef.current = routeQuizId;

    if (
      (!routeQuizId && previousRouteQuizId) ||
      (routeQuizId && createdQuizId && routeQuizId !== createdQuizId)
    ) {
      setCreatedQuizId(null);
    }
  }, [createdQuizId, routeQuizId]);

  // Populate the reducer once for each quiz being edited.
  useEffect(() => {
    if (!effectiveQuizId) {
      if (populatedQuizIdRef.current !== null) {
        populatedQuizIdRef.current = null;
        baselineFormRef.current = createInitialQuizForm();
        dispatchForm({ type: "RESET" });
      }
      return;
    }
    if (isImportingMode) return;

    if (!quizDetail || populatedQuizIdRef.current === effectiveQuizId) return;

    const mappedForm = mapQuizToFormState(quizDetail, userTimeZone);
    if (!mappedForm) return;

    populatedQuizIdRef.current = effectiveQuizId;
    baselineFormRef.current = mappedForm;
    dispatchForm({
      type: "HYDRATE",
      payload: mappedForm,
    });
  }, [effectiveQuizId, quizDetail, userTimeZone]);

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadQuizTemplate().unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "quiz_import_template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(ce.toastTemplateDownloaded || "Tải file mẫu thành công!");
    } catch (err) {
      console.error(err);
      toast.error(ce.toastTemplateDownloadFailed || "Tải file mẫu thất bại.");
    }
  };

  const handleImportFile = async (file) => {
    if (!file) return;
    const files = file instanceof FileList ? Array.from(file) : [file];
    const targetFile = files[0];
    if (files.length > 1) {
      toast.error(
        ce.toastMultipleFilesSelected ||
        "Chỉ hỗ trợ tải lên 1 file mỗi lần. Hệ thống đã chọn file đầu tiên.",
      );
    }

    importFileInputRef.current = null;

    let targetQuizId = effectiveQuizId;
    if (!targetQuizId) {
      setIsImportingMode(true);
      if (!title?.trim()) {
        // ← THÊM LẠI dòng này!
        setIsImportingMode(false);
        toast.error(
          ce.toastEnterTitleBeforeImport ||
          "Vui lòng nhập tên bài kiểm tra trước khi import file.",
        );
        return;
      }
      try {
        const persistedQuiz = await persistQuiz();
        targetQuizId = persistedQuiz?.quizId;
      } catch (error) {
        setIsImportingMode(false);
        toast.error(
          ce.toastAutoCreateFailed ||
          "Không thể tự động tạo bài kiểm tra. Vui lòng thử lại.",
        );
        return;
      }
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      toast.loading(
        ce.toastExtractingQuestions || "Đang trích xuất câu hỏi từ file...",
        {
          id: "import-toast",
        },
      );
      const response = await importTeacherQuestionsPreview({
        classId: id,
        quizId: targetQuizId,
        formData,
      }).unwrap();

      const parsedQuestions = response.questions || [];
      if (parsedQuestions.length === 0) {
        toast.error(
          ce.toastNoValidQuestions ||
          "Không tìm thấy câu hỏi hợp lệ trong file.",
          {
            id: "import-toast",
          },
        );
        return;
      }

      // Map backend preview DTOs to local form state format
      const localQuestions = parsedQuestions.map((q, idx) => {
        let mappedCorrectAnswers = [];
        const qType = q.type;

        if (
          qType === "MultipleChoiceSingle" ||
          qType === "MultipleChoiceMultiple" ||
          qType === "TrueFalse"
        ) {
          // Choice answers are stored as option index strings, e.g. "0", "1"
          const optionsList = q.options || [];
          mappedCorrectAnswers = (q.correctAnswers || [])
            .map((ans) => optionsList.indexOf(ans))
            .filter((index) => index !== -1)
            .map((index) => String(index));
        } else {
          // FillInBlank correct answer contains the exact text
          mappedCorrectAnswers = q.correctAnswers || [];
        }

        return {
          id: `q-import-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
          type: qType || "MultipleChoiceSingle",
          score: q.points ?? 5,
          content: q.content || "",
          options: q.options || [],
          correctAnswers: mappedCorrectAnswers,
          required: q.isRequired ?? true,
          mediaUrl: q.mediaUrl || null,
          tipText: q.explanation || "",
        };
      });

      setFormField("questions", (prev) => [...prev, ...localQuestions]);
      setImportedFileName(file.name);
      setViewMode("edit");
      if (
        !routeQuizId &&
        !location.pathname.includes(`/quiz/${targetQuizId}`)
      ) {
        setSearchParams(
          (prev) => {
            prev.delete("quizId");
            return prev;
          },
          { replace: true },
        );
      }
      toast.success(
        (
          ce.toastExtractSuccess ||
          "Đã trích xuất {{count}} câu hỏi thành công! Bạn có thể chỉnh sửa trước khi lưu."
        ).replace("{{count}}", localQuestions.length),
        { id: "import-toast" },
      );
    } catch (err) {
      if (importFileInputRef.current) {
        importFileInputRef.current.value = "";
      }
      setIsImportingMode(false);
      console.error(err);
      toast.error(
        err?.data?.error ||
        err?.data?.message ||
        ce.toastExtractFailed ||
        "Trích xuất file thất bại.",
        { id: "import-toast" },
      );
    }
  };

  const handleReUploadExcel = () => {
    setImportedFileName(null);
    // Mở hộp thoại chọn file ngay
    if (importFileInputRef.current) {
      importFileInputRef.current.click();
    }
  };

  const handleRemoveImportedFile = () => {
    setImportedFileName(null);
    toast.success(
      ce.toastFileRemoved ||
      "Đã xóa file đã tải lên. Bạn có thể chọn file mới.",
    );
  };

  // Question management handlers
  const handleAddQuestion = useCallback(() => {
    const newId = `q-${Date.now()}`;
    setFormField("questions", (prev) => [
      ...prev,
      {
        id: newId,
        type: "MultipleChoiceSingle",
        score: 5,
        content: "",
        options: ["", ""],
        correctAnswers: [],
        required: true,
      },
    ]);
  }, [setFormField]);

  const handleCopyQuestion = useCallback(
    (index) => {
      const newId = `q-${Date.now()}`;
      setFormField("questions", (prev) =>
        duplicateQuestion(prev, index, newId),
      );
      toast.success(ce.toastQuestionCopied || "Question copied");
    },
    [ce, setFormField],
  );

  const handleDeleteQuestion = useCallback(
    (index) => {
      setFormField("questions", (prev) => prev.filter((_, i) => i !== index));
      toast.success(ce.toastQuestionDeleted || "Question deleted");
    },
    [ce, setFormField],
  );

  const handleQuestionTypeChange = useCallback(
    (index, type) => {
      setFormField("questions", (prev) =>
        prev.map((q, i) => {
          if (i !== index) return q;
          if (type === "Essay") {
            return {
              ...q,
              type: "Essay",
              options: [],
              correctAnswers: [],
              maxWordCount: q.maxWordCount ?? 500,
            };
          } else if (type === "FillInBlank") {
            return {
              ...q,
              type: "FillInBlank",
              options: [],
              correctAnswers: [],
            };
          } else if (type === "TrueFalse") {
            return {
              ...q,
              type: "TrueFalse",
              options: ["True", "False"],
              correctAnswers: [],
            };
          } else if (type === "MultipleChoiceMultiple") {
            return {
              ...q,
              type: "MultipleChoiceMultiple",
              options: q.options && q.options.length >= 2 ? q.options : ["", ""],
              correctAnswers: [],
            };
          } else {
            return {
              ...q,
              type: "MultipleChoiceSingle",
              options: q.options && q.options.length >= 2 ? q.options : ["", ""],
              correctAnswers: [],
            };
          }
        }),
      );
    },
    [setFormField],
  );

  const handleQuestionContentChange = useCallback(
    (index, val) => {
      setFormField("questions", (prev) =>
        prev.map((q, i) => (i === index ? { ...q, content: val } : q)),
      );
    },
    [setFormField],
  );

  const handleScoreChange = useCallback(
    (index, val) => {
      const parsed = val === "" ? "" : parseFloat(val);
      const scoreVal = val === "" ? "" : (isNaN(parsed) ? 0 : parsed);
      setFormField("questions", (prev) =>
        prev.map((q, i) => (i === index ? { ...q, score: scoreVal } : q)),
      );
    },
    [setFormField],
  );

  const handleRequiredToggle = useCallback(
    (index) => {
      setFormField("questions", (prev) =>
        prev.map((q, i) => (i === index ? { ...q, required: !q.required } : q)),
      );
    },
    [setFormField],
  );

  const handleSkillTagChange = useCallback(
    (index, val) => {
      setFormField("questions", (prev) =>
        prev.map((q, i) => (i === index ? { ...q, skillTag: val } : q)),
      );
    },
    [setFormField],
  );

  const handleTipTextChange = useCallback(
    (index, val) => {
      setFormField("questions", (prev) =>
        prev.map((q, i) => (i === index ? { ...q, tipText: val } : q)),
      );
    },
    [setFormField],
  );

  const handleMediaUpload = useCallback(
    (index, file) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error(ce.toastInvalidImage || "Please select a valid image file");
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setFormField("questions", (prev) =>
        prev.map((q, i) =>
          i === index
            ? {
              ...q,
              mediaFile: file,
              mediaUrl: previewUrl,
              clearMedia: false,
            }
            : q,
        ),
      );
      toast.success(ce.toastImageSelected || "Image selected");
    },
    [ce, setFormField],
  );

  const handleAudioUpload = useCallback(
    (index, file) => {
      if (!file) return;
      if (!file.type.startsWith("audio/")) {
        toast.error(ce.toastInvalidAudio || "Please select a valid audio file");
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setFormField("questions", (prev) =>
        prev.map((q, i) =>
          i === index
            ? {
              ...q,
              audioFile: file,
              audioUrl: previewUrl,
              clearAudio: false,
            }
            : q,
        ),
      );
      toast.success(ce.toastAudioSelected || "Audio selected");
    },
    [ce, setFormField],
  );

  const handleRemoveMedia = useCallback(
    (index) => {
      setFormField("questions", (prev) =>
        prev.map((q, i) =>
          i === index
            ? {
              ...q,
              mediaFile: null,
              mediaUrl: null,
              clearMedia: true,
            }
            : q,
        ),
      );
    },
    [setFormField],
  );

  const handleRemoveAudio = useCallback(
    (index) => {
      setFormField("questions", (prev) =>
        prev.map((q, i) =>
          i === index
            ? {
              ...q,
              audioFile: null,
              audioUrl: null,
              clearAudio: true,
            }
            : q,
        ),
      );
    },
    [setFormField],
  );

  // Options & Answers handlers
  const handleAddOption = useCallback(
    (qIdx) => {
      setFormField("questions", (prev) =>
        prev.map((q, i) => {
          if (i !== qIdx) return q;
          const currentOpts = q.options || [];
          return {
            ...q,
            options: [...currentOpts, ""],
          };
        }),
      );
    },
    [setFormField],
  );

  const handleRemoveOption = useCallback(
    (qIdx, optIdx) => {
      setFormField("questions", (prev) =>
        prev.map((q, i) => {
          if (i !== qIdx) return q;
          if (q.options.length <= 2) {
            toast.error(
              ce.toastMinOptions || "There must be at least 2 options",
            );
            return q;
          }
          const updatedOptions = q.options.filter((_, idx) => idx !== optIdx);
          const strOptIdx = String(optIdx);
          const nextCorrect = (q.correctAnswers || [])
            .filter((idxStr) => idxStr !== strOptIdx)
            .map((idxStr) => {
              const num = Number(idxStr);
              return num > optIdx ? String(num - 1) : String(num);
            });
          return {
            ...q,
            options: updatedOptions,
            correctAnswers: nextCorrect,
          };
        }),
      );
    },
    [ce, setFormField],
  );

  const handleOptionTextChange = useCallback(
    (qIdx, optIdx, val) => {
      setFormField("questions", (prev) =>
        prev.map((q, i) => {
          if (i !== qIdx) return q;
          const updatedOptions = [...(q.options || [])];
          updatedOptions[optIdx] = val;
          return {
            ...q,
            options: updatedOptions,
          };
        }),
      );
    },
    [setFormField],
  );

  const handleSingleCorrectAnswer = useCallback(
    (qIdx, optIdx) => {
      setFormField("questions", (prev) =>
        prev.map((q, i) =>
          i === qIdx ? { ...q, correctAnswers: [String(optIdx)] } : q,
        ),
      );
    },
    [setFormField],
  );

  const handleMultipleCorrectAnswerToggle = useCallback(
    (qIdx, optIdx) => {
      setFormField("questions", (prev) =>
        prev.map((q, i) => {
          if (i !== qIdx) return q;
          const strIdx = String(optIdx);
          const current = q.correctAnswers || [];
          const exists = current.includes(strIdx);
          let next;
          if (exists) {
            next = current.filter((x) => x !== strIdx);
          } else {
            next = [...current, strIdx];
          }
          return { ...q, correctAnswers: next };
        }),
      );
    },
    [setFormField],
  );

  const handleFillInBlankAnswerChange = useCallback(
    (qIdx, val) => {
      setFormField("questions", (prev) =>
        prev.map((q, i) => (i === qIdx ? { ...q, correctAnswers: [val] } : q)),
      );
    },
    [setFormField],
  );

  const handleMaxWordCountChange = useCallback(
    (qIdx, val) => {
      const num = parseInt(val, 10) || 500;
      setFormField("questions", (prev) =>
        prev.map((q, i) => (i === qIdx ? { ...q, maxWordCount: num } : q)),
      );
    },
    [setFormField],
  );

  // Move questions up/down
  const handleMoveQuestion = useCallback(
    (index, direction) => {
      setFormField("questions", (prev) => moveQuestion(prev, index, direction));
    },
    [setFormField],
  );

  // Drag and drop handlers
  const handleDragStart = useCallback(
    (e, index) => {
      setDraggedIndexStable(index);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", index.toString());
    },
    [setDraggedIndexStable],
  );

  const handleDragOver = useCallback(
    (e, index) => {
      e.preventDefault();

      const now = e.timeStamp;
      if (now - lastScrollTimeRef.current > 50) {
        const threshold = 120;
        const clientY = e.clientY;
        const viewHeight = window.innerHeight;

        if (clientY < threshold) {
          const distance = threshold - clientY;
          const speed = Math.max(4, Math.min(20, Math.floor(distance / 6)));
          window.scrollBy(0, -speed);
          lastScrollTimeRef.current = now;
        } else if (viewHeight - clientY < threshold) {
          const distance = threshold - (viewHeight - clientY);
          const speed = Math.max(4, Math.min(20, Math.floor(distance / 6)));
          window.scrollBy(0, speed);
          lastScrollTimeRef.current = now;
        }
      }

      // Read the source index from the ref so this callback never has to
      // depend on draggedIndex state and can stay referentially stable.
      const fromIndex = draggedIndexRef.current;
      if (fromIndex === null || fromIndex === index) return;

      setFormField("questions", (prev) =>
        reorderQuestion(prev, fromIndex, index),
      );
      setDraggedIndexStable(index);
    },
    [setDraggedIndexStable, setFormField],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndexStable(null);
    setDraggableIndex(null);
  }, [setDraggedIndexStable]);

  // One stable object so <QuestionCard> can be memoized. Every member is a
  // useCallback, so this identity only changes when the language does.
  const questionHandlers = useMemo(
    () => ({
      handleAddOption,
      handleAudioUpload,
      handleCopyQuestion,
      handleDeleteQuestion,
      handleDragEnd,
      handleDragOver,
      handleDragStart,
      handleFillInBlankAnswerChange,
      handleMaxWordCountChange,
      handleMediaUpload,
      handleMoveQuestion,
      handleMultipleCorrectAnswerToggle,
      handleOptionTextChange,
      handleQuestionContentChange,
      handleQuestionTypeChange,
      handleRemoveAudio,
      handleRemoveMedia,
      handleRemoveOption,
      handleRequiredToggle,
      handleScoreChange,
      handleSingleCorrectAnswer,
      handleSkillTagChange,
      handleTipTextChange,
      setDraggableIndex,
      toggleCollapse,
    }),
    [
      handleAddOption,
      handleAudioUpload,
      handleCopyQuestion,
      handleDeleteQuestion,
      handleDragEnd,
      handleDragOver,
      handleDragStart,
      handleFillInBlankAnswerChange,
      handleMaxWordCountChange,
      handleMediaUpload,
      handleMoveQuestion,
      handleMultipleCorrectAnswerToggle,
      handleOptionTextChange,
      handleQuestionContentChange,
      handleQuestionTypeChange,
      handleRemoveAudio,
      handleRemoveMedia,
      handleRemoveOption,
      handleRequiredToggle,
      handleScoreChange,
      handleSingleCorrectAnswer,
      handleSkillTagChange,
      handleTipTextChange,
      toggleCollapse,
    ],
  );

  // Total score calculation
  const totalScoreVal = Math.round(
    questions.reduce((sum, q) => sum + (Number(q.score) || 0), 0) * 100,
  ) / 100;
  const targetScale = scoreScale === "scale100" ? 100 : 10;
  const isScoreMatched = Math.abs(totalScoreVal - targetScale) < 0.001;

  // Save/Submit Actions
  const handleCancel = () => {
    if (effectiveQuizId) {
      setViewMode("detail");
    } else {
      navigate(`/workspace/courses/class/${id}`);
    }
  };

  const rememberCreatedQuiz = (newQuizId) => {
    const normalizedQuizId = String(newQuizId);
    setCreatedQuizId(normalizedQuizId);
    populatedQuizIdRef.current = normalizedQuizId;

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("quizId", normalizedQuizId);
    setSearchParams(nextSearchParams, { replace: true });

    return normalizedQuizId;
  };

  const persistQuiz = async () => {
    if (!effectiveQuizId) {
      const createResponse = await createTeacherQuiz({
        classId: id,
        ...buildQuizPayload(form, { status: "Draft", userTimeZone }),
      }).unwrap();
      const createdQuiz = getQuizObjectFromResponse(createResponse);
      if (
        !createdQuiz ||
        createdQuiz.id === undefined ||
        createdQuiz.id === null ||
        createdQuiz.id === ""
      ) {
        throw createUnexpectedResponseError();
      }

      const persistedQuizId = rememberCreatedQuiz(createdQuiz.id);
      baselineFormRef.current = form;
      return {
        created: true,
        quizId: persistedQuizId,
      };
    }

    const updatePayload = buildQuizUpdatePayload(
      form,
      baselineFormRef.current,
      { userTimeZone },
    );
    if (quizDetail?.status === "Closed") {
      const changedRestrictedField = Object.keys(updatePayload).find((key) =>
        CLOSED_QUIZ_RESTRICTED_FIELDS.has(key),
      );
      if (changedRestrictedField) {
        const restrictionError = new Error(
          "A closed quiz contains changes to restricted fields.",
        );
        restrictionError.code = "QuizClosedFieldRestricted";
        throw restrictionError;
      }
    }
    if (Object.keys(updatePayload).length > 0) {
      await updateTeacherQuiz({
        classId: id,
        quizId: effectiveQuizId,
        ...updatePayload,
      }).unwrap();
    }

    baselineFormRef.current = form;
    return {
      created: false,
      quizId: effectiveQuizId,
    };
  };

  const handleSaveDraft = async () => {
    if (submissionGuardRef.current) return;

    const validation = validateQuizForm(form, { mode: "draft" });
    if (!validation.isValid) {
      toast.error(getValidationMessage(validation, ce, form));
      return;
    }

    submissionGuardRef.current = true;
    setIsActionPending(true);
    try {
      const persistedQuiz = await persistQuiz();
      const isExistingPublishedQuiz = Boolean(
        effectiveQuizId && quizDetail?.status !== "Draft",
      );
      toast.success(
        isExistingPublishedQuiz
          ? ce.toastChangesSaved || "Changes saved"
          : ce.successDraft || "Quiz draft saved",
      );
      const targetId = persistedQuiz?.quizId || effectiveQuizId;
      if (targetId) {
        setCreatedQuizId(targetId);
        navigate(
          `/workspace/courses/class/${encodeURIComponent(id)}/quiz/${encodeURIComponent(targetId)}`,
          { replace: true },
        );
        setViewMode("detail");
      } else {
        navigate(`/workspace/courses/class/${id}`);
      }
    } catch (error) {
      toast.error(
        getQuizErrorMessage(
          error,
          language,
          ce.errorSave || "The quiz could not be saved. Please try again.",
        ),
      );
    } finally {
      submissionGuardRef.current = false;
      setIsActionPending(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setIsImportingMode(false);
    if (submissionGuardRef.current) return;

    const wantsPublish = publishStatus !== "draft";
    const currentStatus =
      quizDetail?.status ||
      (createdQuizId === effectiveQuizId ? "Draft" : null);
    const shouldPublish =
      wantsPublish && (!effectiveQuizId || currentStatus === "Draft");
    const validation = validateQuizForm(form, {
      mode: wantsPublish ? "publish" : "draft",
    });
    if (!validation.isValid) {
      toast.error(getValidationMessage(validation, ce, form));
      return;
    }

    submissionGuardRef.current = true;
    setIsActionPending(true);
    try {
      const persistedQuiz = await persistQuiz();

      if (shouldPublish) {
        try {
          await publishTeacherQuiz({
            classId: id,
            quizId: persistedQuiz.quizId,
          }).unwrap();
        } catch (error) {
          const publishError = getQuizErrorMessage(
            error,
            language,
            ce.errorPublish ||
            "The quiz could not be published. Check its details and try again.",
          );
          toast.error(
            (
              ce.draftSavedPublishFailed ||
              "The draft was saved but not published. {{error}}"
            ).replace("{{error}}", publishError),
          );
          return;
        }

        toast.success(ce.toastPublishSuccess || "Quiz published successfully.");
      } else if (wantsPublish) {
        toast.success(ce.toastChangesSaved || "Changes saved.");
      } else {
        toast.success(ce.successDraft || "Quiz draft saved.");
      }

      const targetId = persistedQuiz?.quizId || effectiveQuizId;
      if (targetId) {
        setCreatedQuizId(targetId);
        navigate(
          `/workspace/courses/class/${encodeURIComponent(id)}/quiz/${encodeURIComponent(targetId)}`,
          { replace: true },
        );
        setViewMode("detail");
      } else {
        navigate(`/workspace/courses/class/${id}`);
      }
    } catch (error) {
      toast.error(
        getQuizErrorMessage(
          error,
          language,
          ce.errorSave || "The quiz could not be saved. Please try again.",
        ),
      );
    } finally {
      submissionGuardRef.current = false;
      setIsActionPending(false);
    }
  };

  const handlePreview = () => {
    setIsPreviewMode(true);
    setPreviewCurrentIndex(0);
    const durationMinutes = Number(duration);
    setPreviewTimeRemaining(
      Number.isFinite(durationMinutes) && durationMinutes > 0
        ? Math.floor(durationMinutes * 60)
        : 0,
    );
  };

  useEffect(() => {
    if (!isPreviewMode) return;
    const timer = setInterval(() => {
      setPreviewTimeRemaining((previousTime) => {
        if (previousTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return previousTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPreviewMode]);

  const formatTime = (seconds) => {
    const safeSeconds =
      Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (qId, optIdx) => {
    setPreviewAnswers((prev) => ({
      ...prev,
      [qId]: optIdx,
    }));
  };

  const isQuestionAnswered = (q, answersMap) => {
    if (!q) return false;
    const val = answersMap[q.id];
    if (val === undefined || val === null) return false;

    const type = q.type;
    if (
      type === "MultipleChoiceSingle" ||
      type === "mcq" ||
      type === "TrueFalse"
    ) {
      return (
        typeof val === "number" || (typeof val === "string" && val.length > 0)
      );
    }
    if (type === "MultipleChoiceMultiple") {
      return Array.isArray(val) && val.length > 0;
    }
    if (type === "FillInBlank" || type === "Essay") {
      return typeof val === "string" && val.trim().length > 0;
    }
    if (typeof val === "string") return val.trim().length > 0;
    if (Array.isArray(val)) return val.length > 0;
    return true;
  };

  const getQuestionBtnClass = (qId, idx) => {
    const isCurrent = previewCurrentIndex === idx;
    const isFlagged = previewFlagged[qId] === true;

    const targetQ = questions[idx];
    const isAnswered = isQuestionAnswered(targetQ, previewAnswers);

    if (isCurrent) {
      return "w-10 h-10 rounded-full flex items-center justify-center bg-[#990011] text-white font-extrabold decoration-2 shadow-xs cursor-pointer select-none";
    }
    if (isFlagged) {
      return "w-10 h-10 rounded-full flex items-center justify-center border-2 border-red-500 text-red-500 font-extrabold bg-white hover:bg-red-50/10 cursor-pointer shadow-xs select-none";
    }
    if (isAnswered) {
      return "w-10 h-10 rounded-full flex items-center justify-center bg-red-50/70 border border-red-200 text-[#990011] font-extrabold hover:bg-red-50 cursor-pointer shadow-xs select-none";
    }
    return "w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 border border-border text-gray-700 font-extrabold hover:bg-gray-100 cursor-pointer shadow-xs select-none";
  };

  const isLocallyCreatedQuiz = Boolean(
    createdQuizId && createdQuizId === effectiveQuizId,
  );
  const canUseDraftActions =
    !effectiveQuizId || quizDetail?.status === "Draft" || isLocallyCreatedQuiz;
  const isClosedQuiz = quizDetail?.status === "Closed";
  const localizedQuizStatus =
    {
      draft: ce.draftStatus,
      published: ce.publishedStatus,
      open: ce.openStatus,
      closed: ce.closedStatus,
    }[String(quizDetail?.status || "published").toLowerCase()] ||
    ce.unknownStatus;
  const hasBlockingQuizError = Boolean(
    effectiveQuizId &&
    !isLocallyCreatedQuiz &&
    ((isQuizError && !quizDetail) || hasMalformedQuizResponse),
  );

  if (
    effectiveQuizId &&
    !isLocallyCreatedQuiz &&
    (isQuizLoading ||
      (isQuizFetching && quizDetailResponse === undefined) ||
      (quizDetail && populatedQuizIdRef.current !== effectiveQuizId))
  ) {
    return (
      <LoadingSpinner className="flex min-h-[400px] items-center justify-center" />
    );
  }

  if (hasBlockingQuizError) {
    return (
      <div
        role="alert"
        className="mx-auto flex min-h-[400px] max-w-xl flex-col items-center justify-center gap-4 text-center"
      >
        <p className="text-sm font-semibold text-gray-700">
          {hasMalformedQuizResponse
            ? ce.invalidResponse || "The quiz response was invalid."
            : getQuizErrorMessage(
              quizDetailError,
              language,
              ce.loadFailed || "The quiz could not be loaded.",
            )}
        </p>
        <button
          type="button"
          onClick={refetchQuiz}
          className="rounded-xl bg-[#990011] px-4 py-2 text-xs font-bold text-white"
        >
          {ce.retry || "Try again"}
        </button>
      </div>
    );
  }

  if (viewMode === "detail" && effectiveQuizId && !isPreviewMode) {
    return (
      <TeacherQuizDetailView
        classId={id}
        quizId={effectiveQuizId}
        onEdit={() => {
          navigate(
            `/workspace/courses/class/${encodeURIComponent(id)}/quiz/${encodeURIComponent(effectiveQuizId)}/edit`,
          );
          setViewMode("edit");
        }}
        onBack={() => navigate(`/workspace/courses/class/${id}`)}
      />
    );
  }

  if (isPreviewMode) {
    const currentQuestion = questions[previewCurrentIndex];
    const p = ce.preview || {};
    const answeredCount = questions.filter((q) =>
      isQuestionAnswered(q, previewAnswers),
    ).length;

    return (
      <div className="min-h-screen flex flex-col font-sans text-gray-805 -mx-4 -mt-6">
        {/* ─── Top Yellow/Orange Banner ─── */}
        <div className="text-cath-red-700 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none shrink-0">
          <span className="text-sm font-bold tracking-wide flex items-center">
            <span className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 shrink-0">
              <Eye size={18} />
            </span>
            <span className="w-2.5 h-2.5 bg-red-650 rounded-full animate-pulse" />
            {p.bannerText}
          </span>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsPreviewMode(false)}
              className="px-4 py-2 border border-gray-900 text-gray-900 rounded-full hover:bg-black/5 transition-all font-bold text-xs select-none cursor-pointer"
            >
              {p.backToEdit}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit()}
              className="px-5 py-2 bg-[#990011] hover:bg-[#80000e] text-white rounded-full transition-all active:scale-95 font-bold text-xs shadow-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? ce.saving || "Saving..."
                : !canUseDraftActions
                  ? ce.saveChanges || "Save changes"
                  : publishStatus === "draft"
                    ? ce.saveDraft || "Save draft"
                    : p.confirmPublish || "Confirm publish"}
            </button>
          </div>
        </div>

        {/* ─── Sub-header Row ─── */}
        <div className="bg-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs shrink-0 select-none">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
              {title || p.unnamedExam}
            </h1>
          </div>

          <div className="flex items-center gap-6 self-end md:self-auto">
            <div className="flex flex-col gap-1 w-32 sm:w-44 text-right">
              <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                <span>{p.progress}</span>
                <span className="text-gray-900">
                  {answeredCount}/{questions.length}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#990011] transition-all duration-300"
                  style={{
                    width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="px-4 py-2 bg-red-50/20 border border-red-100 rounded-2xl flex items-center gap-2 text-[#990011] font-black tracking-wider text-lg shadow-2xs">
              <Timer size={20} className="animate-pulse" />
              <span>{formatTime(previewTimeRemaining)}</span>
            </div>
          </div>
        </div>

        {/* ─── Main Columns Body ─── */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col lg:flex-row gap-6">
          {/* Left Area: Active Question card */}
          <div className="flex-1 flex flex-col gap-6">
            {questions.length === 0 ? (
              <div className="bg-white rounded-3xl border border-border p-12 text-center text-gray-400 font-bold shadow-xs">
                {p.emptyQuestions}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-border p-6 md:p-8 flex flex-col gap-6 shadow-xs">
                {/* Card Title & Score info */}
                <div className="flex justify-between items-center border-b border-border pb-4 select-none">
                  <h2 className="text-lg font-black text-[#990011] tracking-tight">
                    {(ce.questionNumber || "Question {{number}}").replace(
                      "{{number}}",
                      previewCurrentIndex + 1,
                    )}
                  </h2>
                  <span className="px-3.5 py-1.5 bg-gray-50 border border-border rounded-xl text-xs font-bold text-gray-500">
                    {currentQuestion.score} {p.points}
                  </span>
                </div>

                {/* Question Image Media (Image on top) */}
                {currentQuestion.mediaUrl && !currentQuestion.clearMedia && (
                  <div className="rounded-2xl overflow-hidden border border-border bg-gray-50 flex items-center justify-center p-2">
                    <img
                      src={currentQuestion.mediaUrl}
                      alt={(
                        ce.questionImageAlt ||
                        "Illustration for question {{number}}"
                      ).replace("{{number}}", previewCurrentIndex + 1)}
                      className="max-h-48 max-w-xs sm:max-w-sm w-auto h-auto object-contain rounded-xl"
                    />
                  </div>
                )}

                {/* Question Audio Media (Audio play below image) */}
                {currentQuestion.audioUrl && !currentQuestion.clearAudio && (
                  <div className="p-3 bg-red-50/20 border border-red-100 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#990011] text-white flex items-center justify-center shrink-0">
                      <MusicIcon size={16} />
                    </div>
                    <audio
                      controls
                      src={currentQuestion.audioUrl}
                      className="w-full h-9 rounded-xl"
                    />
                  </div>
                )}

                {/* Question text content */}
                <RenderHTML
                  html={currentQuestion.content}
                  className="text-sm font-semibold text-gray-800 leading-relaxed"
                  fallback={ce.noQuestionContent || "No question content yet."}
                />

                {/* Options/Answers selection list */}
                {currentQuestion.type === "MultipleChoiceSingle" ||
                  currentQuestion.type === "mcq" ? (
                  <div className="flex flex-col gap-3">
                    {(currentQuestion.options || []).map((opt, optIdx) => {
                      const isSelected =
                        previewAnswers[currentQuestion.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() =>
                            handleSelectOption(currentQuestion.id, optIdx)
                          }
                          className={`flex w-full items-center gap-3 p-4 border rounded-2xl cursor-pointer select-none text-left transition-all active:scale-[0.99] ${isSelected
                            ? "border-[#990011] bg-red-50/10"
                            : "border-border bg-gray-50/50 hover:bg-gray-150/30"
                            }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`w-5 h-5 border rounded-full flex items-center justify-center transition-all shrink-0 ${isSelected
                              ? "border-[#990011] bg-red-50/10"
                              : "border-gray-300"
                              }`}
                          >
                            {isSelected && (
                              <span className="w-2.5 h-2.5 bg-[#990011] rounded-full" />
                            )}
                          </span>
                          <span
                            className={`text-xs font-bold ${isSelected ? "text-[#990011]" : "text-gray-700"}`}
                          >
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : currentQuestion.type === "MultipleChoiceMultiple" ? (
                  <div className="flex flex-col gap-3">
                    {(currentQuestion.options || []).map((opt, optIdx) => {
                      const selectedList =
                        previewAnswers[currentQuestion.id] || [];
                      const isSelected = selectedList.includes(optIdx);
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => {
                            setPreviewAnswers((prev) => {
                              const prevSel = prev[currentQuestion.id] || [];
                              const nextSel = prevSel.includes(optIdx)
                                ? prevSel.filter((x) => x !== optIdx)
                                : [...prevSel, optIdx];
                              return { ...prev, [currentQuestion.id]: nextSel };
                            });
                          }}
                          className={`flex w-full items-center gap-3 p-4 border rounded-2xl cursor-pointer select-none text-left transition-all active:scale-[0.99] ${isSelected
                            ? "border-[#990011] bg-red-50/10"
                            : "border-border bg-gray-50/50 hover:bg-gray-150/30"
                            }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${isSelected ? "border-[#990011] bg-[#990011]" : "border-gray-300"}`}
                          >
                            {isSelected && (
                              <span className="h-2 w-2 bg-white" />
                            )}
                          </span>
                          <span
                            className={`text-xs font-bold ${isSelected ? "text-[#990011]" : "text-gray-700"}`}
                          >
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : currentQuestion.type === "TrueFalse" ? (
                  <div className="flex flex-col gap-3">
                    {(currentQuestion.options || []).map((opt, optIdx) => {
                      const isSelected =
                        previewAnswers[currentQuestion.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() =>
                            handleSelectOption(currentQuestion.id, optIdx)
                          }
                          className={`flex w-full items-center gap-3 p-4 border rounded-2xl cursor-pointer select-none text-left transition-all active:scale-[0.99] ${isSelected
                            ? "border-[#990011] bg-red-50/10"
                            : "border-border bg-gray-50/50 hover:bg-gray-150/30"
                            }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`w-5 h-5 border rounded-full flex items-center justify-center transition-all shrink-0 ${isSelected
                              ? "border-[#990011] bg-red-50/10"
                              : "border-gray-300"
                              }`}
                          >
                            {isSelected && (
                              <span className="w-2.5 h-2.5 bg-[#990011] rounded-full" />
                            )}
                          </span>
                          <span
                            className={`text-xs font-bold ${isSelected ? "text-[#990011]" : "text-gray-700"}`}
                          >
                            {optIdx === 0
                              ? ce.trueLabel || "True"
                              : ce.falseLabel || "False"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : currentQuestion.type === "FillInBlank" ? (
                  <input
                    type="text"
                    aria-label={ce.answerLabel || "Answer"}
                    value={previewAnswers[currentQuestion.id] || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPreviewAnswers((prev) => ({
                        ...prev,
                        [currentQuestion.id]: val,
                      }));
                    }}
                    placeholder={ce.answerPlaceholder || "Enter answer here..."}
                    className="w-full p-4 border border-border rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011]"
                  />
                ) : (
                  /* Essay Answer Area */
                  <textarea
                    aria-label={ce.essayAnswerLabel || "Essay answer"}
                    value={previewAnswers[currentQuestion.id] || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPreviewAnswers((prev) => ({
                        ...prev,
                        [currentQuestion.id]: val,
                      }));
                    }}
                    placeholder={p.essayPlaceholder}
                    className="w-full p-4 border border-border rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] min-h-[140px] resize-y transition-all"
                  />
                )}
              </div>
            )}
          </div>

          {/* Right Area: Questions Grid sidebar */}
          <div className="w-full lg:w-80 shrink-0 select-none">
            <div className="bg-white rounded-3xl border border-border p-6 flex flex-col gap-5 shadow-xs">
              <div className="flex items-center gap-2 text-gray-800 border-b border-border pb-3">
                <LayoutGrid size={18} className="text-[#990011]" />
                <h3 className="text-sm font-black tracking-tight">
                  {p.questionsList}
                </h3>
              </div>

              {/* Grid map */}
              <div className="grid grid-cols-5 gap-3 max-w-[280px] sm:max-w-none mx-auto lg:mx-0">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    type="button"
                    aria-current={
                      previewCurrentIndex === idx ? "step" : undefined
                    }
                    aria-label={(
                      ce.questionNumber || "Question {{number}}"
                    ).replace("{{number}}", idx + 1)}
                    onClick={() => setPreviewCurrentIndex(idx)}
                    className={getQuestionBtnClass(q.id, idx)}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <div className="h-px bg-gray-100 my-1" />

              {/* Legend details */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[10px] font-bold text-gray-500 pl-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gray-50 border border-border flex items-center justify-center text-gray-700 text-[10px]" />
                  <span>{p.unanswered}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-50/70 border border-red-200 flex items-center justify-center text-[#990011] text-[10px]" />
                  <span>{p.answered}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#990011] text-white flex items-center justify-center text-[10px] underline decoration-1" />
                  <span>{p.current}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full border-2 border-red-500 text-red-500 bg-white flex items-center justify-center text-[10px]" />
                  <span>{p.flagged}</span>
                </div>
              </div>

              <div className="h-px bg-gray-100 my-1" />

              {/* Navigation controls */}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={questions.length === 0 || previewCurrentIndex === 0}
                  onClick={() =>
                    setPreviewCurrentIndex((prev) => Math.max(0, prev - 1))
                  }
                  className="flex-1 py-2.5 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-full flex items-center justify-center gap-1 hover:shadow-md transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                >
                  <ArrowLeft size={12} />
                  <span>{p.prevQuestion}</span>
                </button>
                <button
                  type="button"
                  disabled={
                    questions.length === 0 ||
                    previewCurrentIndex === questions.length - 1
                  }
                  onClick={() =>
                    setPreviewCurrentIndex((prev) =>
                      Math.min(questions.length - 1, prev + 1),
                    )
                  }
                  className="flex-1 py-2.5 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-full flex items-center justify-center gap-1 hover:shadow-md transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                >
                  <span>{p.nextQuestion}</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              {/* Flag for review control */}
              {questions.length > 0 && (
                <button
                  type="button"
                  aria-pressed={previewFlagged[currentQuestion.id] === true}
                  onClick={() => {
                    const qId = currentQuestion.id;
                    setPreviewFlagged((prev) => ({
                      ...prev,
                      [qId]: !prev[qId],
                    }));
                  }}
                  className="w-full py-2.5 border border-[#990011] text-[#990011] hover:bg-red-50/20 font-extrabold text-xs rounded-full flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer mt-1"
                >
                  <Flag size={12} />
                  <span>
                    {previewFlagged[currentQuestion.id]
                      ? p.unmarkReview
                      : p.markReview}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">
      {isLocallyCreatedQuiz && (isQuizError || hasMalformedQuizResponse) && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900"
        >
          <span>
            {ce.draftReloadFailed ||
              "The draft was saved, but its latest data could not be reloaded."}
          </span>
          <button
            type="button"
            onClick={refetchQuiz}
            className="font-extrabold underline"
          >
            {ce.retry || "Retry"}
          </button>
        </div>
      )}

      {/* ─── Breadcrumbs ─── */}
      <Breadcrumb
        items={[
          {
            label: t.nav?.home || "Trang chủ",
            onClick: () => navigate("/workspace"),
          },
          {
            label: c.title || "Khóa học của tôi",
            onClick: () => navigate("/workspace/courses"),
          },
          {
            label: c.allCourses?.title || "Toàn bộ khóa học",
            onClick: () => navigate("/workspace/courses/all"),
          },
          ...(classData.courseId
            ? [
              {
                label:
                  t.courses?.student?.courseDetails || "Chi tiết khóa học",
                onClick: () =>
                  navigate(
                    `/workspace/courses/details/${encodeURIComponent(String(classData.courseId))}`,
                  ),
              },
            ]
            : []),
          {
            label: t.courses?.student?.classDetails || "Chi tiết lớp học",
            onClick: () =>
              navigate(
                `/workspace/courses/class/${encodeURIComponent(String(id))}`,
              ),
          },
          {
            label: effectiveQuizId
              ? ce.editTitle || "Edit Exam"
              : ce.pageTitle || "Create Exam",
          },
        ]}
      />

      {/* ─── Page Title ─── */}
      <h1 className="text-3xl font-black text-gray-950 tracking-tight">
        {effectiveQuizId
          ? ce.editTitle || "Edit Exam"
          : ce.pageTitle || "Create New Exam"}
      </h1>

      {isClosedQuiz && (
        <div
          role="note"
          className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900"
        >
          {ce.closedNotice ||
            "This quiz is closed. Its schedule, late-submission setting, time limit, questions, grading scale, and result-release mode can no longer be changed."}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row gap-6 items-start"
      >
        {/* ─── Main Form Panel (Left) ─── */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          {/* Card: Base Info */}
          <div className="bg-white border border-border rounded-3xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-800">
                {ce.examNameLabel || "Tên bài kiểm tra"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setFormField("title", e.target.value)}
                placeholder={
                  ce.examNamePlaceholder ||
                  "Nhập tên bài kiểm tra (VD: Bài kiểm tra giữa kỳ)"
                }
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] transition-all text-sm"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-800">
                {ce.descriptionLabel || "Mô tả / Hướng dẫn"}
              </label>

              <Editor
                tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js"
                value={editorText}
                onEditorChange={(newVal) => setFormField("editorText", newVal)}
                init={{
                  height: 185,
                  menubar: false,
                  statusbar: false,
                  plugins: [
                    "autolink",
                    "lists",
                    "link",
                    "charmap",
                    "emoticons",
                  ],
                  toolbar:
                    "bold italic underline strikethrough | emoticons link | bullist numlist",
                  // placeholder: ce.descriptionPlaceholder,
                  skin: "oxide",
                  setup: (editor) => {
                    editor.on("focus", () => { });
                  },
                }}
              />
            </div>
          </div>

          {/* Heading: Questions list */}
          <div className="flex flex-wrap justify-between items-center gap-2 px-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800">
                {ce.questionsList || "Danh sách câu hỏi"}
              </h2>
              <IconButton
                variant="ghost"
                size="xs"
                onClick={() => setIsExcelInstructionOpen(true)}
                title={ce.importExcelHowToTitle || "Cách điền file Excel"}
              >
                <Info className="w-5 h-5" />
              </IconButton>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-gray-500 flex items-center gap-1.5">
                {ce.totalScore || "Tổng điểm"}:
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black transition-all ${questions.length > 0 && isScoreMatched
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs"
                    : "bg-red-50 text-[#990011] border border-red-200 shadow-2xs"
                    }`}
                  title={`${totalScoreVal} / ${targetScale}`}
                >
                  <span>{totalScoreVal}</span>
                  <span className="opacity-40 font-normal">/</span>
                  <span>{targetScale}</span>
                  {questions.length > 0 && isScoreMatched && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block ml-0.5" />
                  )}
                </span>
              </span>
            </div>
          </div>

          {/* Questions Container */}
          <div className="flex flex-col gap-4">
            {importedFileName ? (
              <div className="border-2 border-green-300 bg-green-50/50 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <svg
                      className="w-7 h-7 text-green-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                      <polyline points="7 15 10.5 18.5 17 12" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3
                      className="text-sm font-extrabold text-gray-800 truncate"
                      title={importedFileName}
                    >
                      {importedFileName}
                    </h3>
                    <p className="text-xs text-green-700 mt-0.5">
                      {ce.extractedSuccessDesc ||
                        "Đã trích xuất câu hỏi thành công — có thể chỉnh sửa trực tiếp bên dưới."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleReUploadExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-[#990011] hover:bg-[#80000e] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    {ce.reupload || "Upload lại"}
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-red-200 bg-[#990011]/[0.02] rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all hover:border-[#990011] cursor-pointer"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const files = e.dataTransfer.files;
                  if (!files || files.length === 0) return;
                  if (files.length > 1) {
                    toast.error(
                      ce.uploadSingleFileOnlyDragDrop ||
                      "Chỉ hỗ trợ tải lên 1 file mỗi lần. Vui lòng kéo thả 1 file duy nhất.",
                    );
                    return;
                  }
                  handleImportFile(files[0]);
                }}
              >
                {/* File Icon */}
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-2">
                  <svg
                    className="w-7 h-7 text-[#990011]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path
                      d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
                      fill="#990011"
                      fillOpacity="0.1"
                    />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M12 18v-6" />
                    <polyline points="9 15 12 12 15 15" />
                  </svg>
                </div>
                <h3 className="text-base font-extrabold text-gray-800">
                  {ce.importFromExcel || "Nhập câu hỏi từ file Excel"}
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  {ce.uploadExcelDesc ||
                    "Tải lên file Excel (.xlsx) theo mẫu để tự động tạo câu hỏi."}
                </p>
                {/* Modal trigger via Info icon instead */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                  <label className="flex items-center gap-2 px-5 py-2.5 bg-[#990011] hover:bg-[#80000e] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                    {ce.chooseFile || "Chọn tệp"}
                    <input
                      type="file"
                      accept=".xlsx"
                      className="hidden"
                      ref={importFileInputRef}
                      onChange={(e) => {
                        if (e.target.files?.length > 1) {
                          toast.error(
                            ce.uploadSingleFileOnlySelect ||
                            "Chỉ hỗ trợ tải lên 1 file mỗi lần. Vui lòng chọn lại 1 file duy nhất.",
                          );
                          e.target.value = "";
                          return;
                        }
                        if (e.target.files?.[0]) {
                          handleImportFile(e.target.files[0]);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    disabled={isDownloadingTemplate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold border border-gray-300 rounded-xl transition-all shadow-xs disabled:opacity-55"
                  >
                    <svg
                      className="w-4 h-4 text-gray-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {ce.downloadTemplate || "Tải file mẫu"}
                  </button>
                </div>
                <div className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                  {ce.supportedFormat ||
                    "Định dạng hỗ trợ: .xlsx | Dung lượng tối đa: 20 MB"}
                  <br />
                  {ce.orDragDrop || "hoặc kéo thả tệp vào đây"}
                </div>
              </div>
            )}

            {questions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={idx}
                total={questions.length}
                collapsed={Boolean(collapsedQuestions[q.id])}
                isDragged={draggedIndex === idx}
                isDraggable={draggableIndex === idx}
                ce={ce}
                handlers={questionHandlers}
              />
            ))}
          </div>

          {/* Dashed button: Add new question */}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="border-2 border-dashed border-red-100 hover:border-[#990011] bg-red-50/10 hover:bg-red-50/20 transition-all rounded-3xl p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-[#990011] group-hover:scale-110 transition-transform">
              <Plus size={20} />
            </div>
            <span className="text-sm font-bold text-[#990011] tracking-wide">
              {ce.addQuestion || "Thêm câu hỏi mới"}
            </span>
          </button>
        </div>

        {/* ─── Settings Panel (Right) ─── */}
        <div className="w-full lg:w-[320px] bg-white border border-border rounded-3xl p-6 flex flex-col gap-5 shadow-sm shrink-0 lg:sticky lg:top-4">
          <h2 className="text-lg font-black text-gray-900 border-b border-border pb-3">
            {ce.sidebarTitle || "Cấu hình bài kiểm tra"}
          </h2>

          {/* Time Limit */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-800">
              {ce.durationLabel || "Thời gian làm bài (Phút)"}
            </label>
            <input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setFormField("duration", e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] font-bold"
              placeholder={ce.minutesPlaceholder || "Minutes"}
            />
          </div>

          {/* Max Attempts Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-800">
              {ce.maxAttempts || "Maximum attempts"}
            </label>
            <div className="relative">
              <select
                value={maxAttempts}
                onChange={(e) =>
                  setFormField("maxAttempts", Number(e.target.value))
                }
                className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-border rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] appearance-none cursor-pointer"
              >
                {Number.isInteger(Number(maxAttempts)) &&
                  Number(maxAttempts) > 0 &&
                  ![1, 2, 3, 5].includes(Number(maxAttempts)) && (
                    <option value={Number(maxAttempts)}>
                      {(ce.attemptsCount || "{{count}} attempts").replace(
                        "{{count}}",
                        maxAttempts,
                      )}
                    </option>
                  )}
                <option value={1}>{ce.oneAttempt || "1 attempt"}</option>
                {[2, 3, 5].map((count) => (
                  <option key={count} value={count}>
                    {(ce.attemptsCount || "{{count}} attempts").replace(
                      "{{count}}",
                      count,
                    )}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3.5 top-2.5 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Pass Percent Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-800">
                {ce.passScore || "Pass score (%)"}
              </label>
              <span className="text-xs font-extrabold text-[#990011]">
                {passPercent}%
              </span>
            </div>
            <input
              type="number"
              min="0"
              max="100"
              value={passPercent}
              onChange={(e) =>
                setFormField(
                  "passPercent",
                  Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)),
                )
              }
              className="w-full px-3 py-2 bg-gray-50 border border-border rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011]"
              placeholder="50"
            />
          </div>

          {/* Open Time */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-bold text-gray-800">
              {ce.openTimeLabel || "Thời gian mở"}
            </label>
            <DatePicker
              value={openDate}
              onChange={(date) => setFormField("openDate", date)}
              mode="datetime"
              color="#990011"
              placeholder={ce.dateTimePlaceholder || "DD/MM/YYYY, --:--"}
              className="w-full"
            />
          </div>

          {/* Close Time */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-bold text-gray-800">
              {ce.closeTimeLabel || "Thời gian đóng"}
            </label>
            <DatePicker
              value={closeDate}
              onChange={(date) => setFormField("closeDate", date)}
              mode="datetime"
              color="#990011"
              placeholder={ce.dateTimePlaceholder || "DD/MM/YYYY, --:--"}
              className="w-full"
            />
          </div>

          <div className="h-px bg-gray-100 w-full" />

          {/* Advanced Settings */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wide">
              {ce.advancedSettings || "Cài đặt nâng cao"}
            </span>

            {/* Allow Late Submission */}
            <SettingToggleRow
              label={ce.allowLateSubmission || "Allow late submission"}
              checked={allowLateSubmission}
              onChange={(e) =>
                setFormField("allowLateSubmission", e.target.checked)
              }
            />

            {/* Shuffle Questions */}
            <SettingToggleRow
              label={ce.shuffleQuestions || "Xáo trộn câu hỏi"}
              checked={shuffleQuestions}
              onChange={(e) =>
                setFormField("shuffleQuestions", e.target.checked)
              }
            />

            {/* Shuffle Answers */}
            <SettingToggleRow
              label={ce.shuffleOptions || "Xáo trộn đáp án"}
              checked={shuffleOptions}
              onChange={(e) =>
                setFormField("shuffleOptions", e.target.checked)
              }
            />

            {/* Show Answer After Submission */}
            <SettingToggleRow
              label={ce.showAnswers || "Hiển thị đáp án sau khi nộp"}
              checked={showAnswers}
              onChange={(e) =>
                setFormField("showAnswers", e.target.checked)
              }
            />

            {/* Auto Grade */}
            <SettingToggleRow
              label={ce.autoGrading || "Chấm điểm tự động"}
              checked={autoGrading}
              onChange={(e) =>
                setFormField("autoGrading", e.target.checked)
              }
            />

            {/* Score Scale Dropdown */}
            <div className="flex flex-col gap-1.5 mt-1">
              <label className="text-xs font-bold text-gray-800">
                {ce.scoreScale || "Thang điểm"}
              </label>
              <div className="relative">
                <select
                  value={scoreScale}
                  onChange={(e) => setFormField("scoreScale", e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-border rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] appearance-none cursor-pointer"
                >
                  <option value="scale10">
                    {ce.scale10 || "Thang điểm 10"}
                  </option>
                  <option value="scale100">
                    {ce.scale100 || "Thang điểm 100"}
                  </option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3.5 top-2.5 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Result Release Dropdown */}
            <div className="flex flex-col gap-1.5 mt-1">
              <label className="text-xs font-bold text-gray-800">
                {ce.resultRelease || "Công bố kết quả"}
              </label>
              <div className="relative">
                <select
                  value={resultRelease}
                  onChange={(e) =>
                    setFormField("resultRelease", e.target.value)
                  }
                  className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-border rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] appearance-none cursor-pointer"
                >
                  <option value="manual">
                    {ce.releaseManual || "Công bố thủ công"}
                  </option>
                  <option value="automatic">
                    {ce.releaseAutomatic || "Tự động công bố sau khi chấm"}
                  </option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3.5 top-2.5 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 w-full" />

          {/* Publish Status */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-gray-800">
              {ce.publishStatus || "Trạng thái đăng"}
            </span>

            {canUseDraftActions ? (
              <div
                role="radiogroup"
                aria-label={ce.publishStatus || "Publish status"}
                className="flex flex-col gap-2.5"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={publishStatus === "now"}
                  onClick={() => setFormField("publishStatus", "now")}
                  className="flex items-center gap-3 cursor-pointer select-none text-left"
                >
                  <span
                    className={`w-5 h-5 border rounded-full flex items-center justify-center transition-all ${publishStatus === "now"
                      ? "border-[#990011]"
                      : "border-gray-300"
                      }`}
                  >
                    {publishStatus === "now" && (
                      <span className="w-2.5 h-2.5 bg-[#990011] rounded-full" />
                    )}
                  </span>
                  <span className="text-xs font-semibold text-gray-750">
                    {ce.publishNow || "Đăng ngay"}
                  </span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={publishStatus === "draft"}
                  onClick={() => setFormField("publishStatus", "draft")}
                  className="flex items-center gap-3 cursor-pointer select-none text-left"
                >
                  <span
                    className={`w-5 h-5 border rounded-full flex items-center justify-center transition-all ${publishStatus === "draft"
                      ? "border-[#990011]"
                      : "border-gray-300"
                      }`}
                  >
                    {publishStatus === "draft" && (
                      <span className="w-2.5 h-2.5 bg-[#990011] rounded-full" />
                    )}
                  </span>
                  <span className="text-xs font-semibold text-gray-750">
                    {ce.saveDraft || "Lưu nháp"}
                  </span>
                </button>
              </div>
            ) : (
              <span className="rounded-xl bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">
                {(ce.currentStatus || "Current status: {{status}}").replace(
                  "{{status}}",
                  localizedQuizStatus,
                )}
              </span>
            )}
          </div>

          {/* Post to Bulletin board */}
          <div className="bg-red-50/20 border border-red-100 rounded-2xl p-4 flex justify-between items-center shadow-xs">
            <span className="text-xs font-bold text-gray-800">
              {ce.postToFeed || "Đăng lên giảng đường"}
            </span>
            <Switch
              checked={Boolean(postToFeed)}
              onChange={(e) => setFormField("postToFeed", e.target.checked)}
              colorClass="peer-checked:bg-[#990011]"
              size="sm"
              aria-label={ce.postToFeed || "Post to class feed"}
            />
          </div>
        </div>
      </form>

      {/* ─── Footer Buttons ─── */}
      <div className="flex justify-between items-center py-4 border-t border-border mt-4">
        <button
          type="button"
          onClick={handleCancel}
          className="text-xs font-extrabold text-gray-500 hover:text-gray-700 transition-colors uppercase tracking-wider"
        >
          {ce.btnCancel || "Hủy"}
        </button>

        <div className="flex items-center gap-3">
          {/* Preview button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handlePreview}
            className="p-2.5 border border-border hover:bg-gray-50 text-gray-600 rounded-xl transition-all active:scale-95 shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
            title={ce.previewLabel || "Preview"}
          >
            <Eye size={18} />
          </button>

          {/* Save Draft */}
          {canUseDraftActions && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveDraft}
              className="h-10 px-5 border border-[#990011] text-[#990011] hover:bg-red-50/50 font-extrabold text-xs rounded-xl transition-all active:scale-95 shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ce.btnSaveDraft || "Lưu nháp"}
            </button>
          )}

          {/* Submit */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit()}
            className="h-10 px-6 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-xl transition-all active:scale-95 shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? ce.saving || "Saving..."
              : !canUseDraftActions
                ? ce.saveChanges || "Save Changes"
                : publishStatus === "draft"
                  ? ce.saveDraft || "Save Draft"
                  : effectiveQuizId
                    ? ce.publishQuiz || "Publish Quiz"
                    : ce.btnCreate || "Create Exam"}
          </button>
        </div>
      </div>
      <ImportExcelInstructionModal
        open={isExcelInstructionOpen}
        onClose={() => setIsExcelInstructionOpen(false)}
        ce={ce}
      />
    </div>
  );
};

const CreateExamPage = () => {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const ce = t.courses?.createExam || {};

  const {
    currentData: detailResponse,
    error: classDetailError,
    isError: isClassError,
    isLoading: isClassLoading,
    isFetching: isClassFetching,
    refetch: refetchClass,
  } = useGetClassDetailQuery(id, { skip: !id });

  if (isClassLoading || (isClassFetching && detailResponse === undefined)) {
    return (
      <LoadingSpinner className="flex justify-center items-center min-h-[400px]" />
    );
  }

  const rawClassData =
    detailResponse &&
      typeof detailResponse === "object" &&
      !Array.isArray(detailResponse) &&
      "data" in detailResponse
      ? detailResponse.data
      : detailResponse;
  const classData =
    rawClassData &&
      typeof rawClassData === "object" &&
      !Array.isArray(rawClassData) &&
      rawClassData.id
      ? rawClassData
      : null;

  if (isClassError || !classData) {
    return (
      <div
        role="alert"
        className="mx-auto flex min-h-[400px] max-w-xl flex-col items-center justify-center gap-4 text-center"
      >
        <p className="text-sm font-semibold text-gray-700">
          {getQuizErrorMessage(
            classDetailError,
            language,
            ce.classLoadFailed || "The class details could not be loaded.",
          )}
        </p>
        <button
          type="button"
          onClick={refetchClass}
          className="rounded-xl bg-[#990011] px-4 py-2 text-xs font-bold text-white"
        >
          {ce.retry || "Try again"}
        </button>
      </div>
    );
  }

  return (
    <CreateExamForm
      key={id}
      id={id}
      classData={classData}
      language={language}
      t={t}
    />
  );
};

export default CreateExamPage;
