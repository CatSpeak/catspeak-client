import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PlanCard from "../subscription/components/PlanCard";
import { useGetUserProfileQuery } from "@/store/api/userApi";
import { useGetPlansQuery } from "@/store/api/plansApi";
import { useAuth } from "@/features/auth";
import { useLanguage } from "@/shared/context/LanguageContext";
import { getGridClasses } from "../utils/planUtils";
import { X } from "lucide-react";

const PricingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { data: profileResponse, isLoading: isProfileLoading } =
    useGetUserProfileQuery(undefined, { skip: !isAuthenticated });
  const { data: plansResponse = [], isLoading: isPlansLoading } =
    useGetPlansQuery();

  const userTier = profileResponse?.tier?.toLowerCase();

  // Capture route state into a ref at mount so navigate() clearing history state
  // doesn't cause highlightPlan to become undefined mid-effect.
  const highlightStateRef = useRef({
    plan: location.state?.highlightPlan?.toLowerCase() || null,
    featureName: location.state?.featureName || null,
  });
  const highlightPlan = highlightStateRef.current.plan;
  const featureName = highlightStateRef.current.featureName;
  const highlightedRef = useRef(null);

  const [activeHighlight, setActiveHighlight] = React.useState(false);

  useEffect(() => {
    if (highlightPlan && !isPlansLoading) {
      // Clear route state so refreshing (F5) will not re-trigger highlight
      navigate(location.pathname, { replace: true, state: {} });

      const startHighlightTimer = setTimeout(() => {
        setActiveHighlight(true);
      }, 300);

      const revertTimer = setTimeout(() => {
        setActiveHighlight(false);
      }, 3600);

      return () => {
        clearTimeout(startHighlightTimer);
        clearTimeout(revertTimer);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlansLoading]);

  const handleClose = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleUpgradeClick = (plan) => {
    navigate("/checkout", { state: { plan } });
  };

  const isProcessing = isProfileLoading || isPlansLoading;

  const publishedPlans = plansResponse.filter(
    (plan) => plan.packageStatus === "Published",
  );

  // Union of features per applicableRole (sorted by displayOrder).
  const unionByRole = {};
  publishedPlans.forEach((plan) => {
    const role = (plan.applicableRole || "__all__").toLowerCase();
    if (!unionByRole[role]) unionByRole[role] = new Map();
    (plan.subscriptionFeatures || []).forEach((f) => {
      const key = (f.featureCode || "").toUpperCase();
      if (!key || unionByRole[role].has(key)) return;
      unionByRole[role].set(key, {
        code: f.featureCode,
        name: f.featureName,
        displayOrder: f.displayOrder ?? 999,
      });
    });
  });
  Object.values(unionByRole).forEach((map) => {
    const sorted = [...map.entries()].sort(
      (a, b) => a[1].displayOrder - b[1].displayOrder,
    );
    map.clear();
    sorted.forEach(([k, v]) => map.set(k, v));
  });

  const formattedPlans = publishedPlans.map((plan) => {
    const role = (plan.applicableRole || "__all__").toLowerCase();
    const union = unionByRole[role] || new Map();
    const ownByCode = new Map(
      (plan.subscriptionFeatures || []).map((f) => [
        (f.featureCode || "").toUpperCase(),
        f,
      ]),
    );
    const features = [...union.entries()].map(([key, u]) => {
      const own = ownByCode.get(key);
      if (!own) {
        return {
          id: `missing-${key}`,
          name: u.name,
          code: u.code,
          isMissing: true,
        };
      }
      return {
        id: own.id,
        name: own.featureName,
        limitValue: own.limitValue,
        valueType: own.valueType?.toLowerCase(),
        code: own.featureCode,
        isActive: own.isActive,
        displayOrder: own.displayOrder,
      };
    });
    return {
      id: plan.planId,
      name: plan.planName,
      price: plan.priceVnd,
      interval: plan.billingCycle,
      description: plan.description,
      features,
      applicableRole: plan.applicableRole?.toLowerCase(),
      iconUrl: plan.iconUrl,
      brandColor: plan.brandColor,
    };
  });

  return (
    <div className="relative w-full h-screen max-h-screen overflow-hidden bg-primaryBg flex items-center justify-center px-4 sm:px-6 lg:px-8 select-none animate-in fade-in duration-300">
      {/* Top-Right Close Button (X) */}
      <button
        onClick={handleClose}
        aria-label="Đóng"
        className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 active:scale-95 transition-all cursor-pointer z-50"
      >
        <X size={24} />
      </button>

      {/* Unified Centered Block (Title + Cards) */}
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center">
        {/* Centered Page Title */}
        <div className="shrink-0 text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight leading-tight">
            {t.billing?.pricing?.title || "Gói đăng ký"}
          </h1>
        </div>

        {/* Main Pricing Cards Area */}
        <div className="w-full flex items-center justify-center">
          {isPlansLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full items-stretch">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="border border-border bg-white p-6 rounded-xl shadow-sm animate-pulse flex flex-col justify-between h-[calc(100dvh-11rem)] min-h-[550px] max-h-[740px]"
                >
                <div className="space-y-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-10 bg-gray-200 rounded w-1/2" />
                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                    <div className="h-4 bg-gray-200 rounded w-4/5" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
                <div className="h-12 bg-gray-200 rounded-lg w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className={getGridClasses(formattedPlans.length)}>
            {formattedPlans.map((plan) => {
              const isActive = userTier === plan.name?.toLowerCase();
              const isTargetMatch =
                highlightPlan &&
                plan.name?.toLowerCase().includes(highlightPlan);
              const isTargetHighlighted = activeHighlight && isTargetMatch;

              return (
                <div
                  key={plan.id}
                  ref={isTargetMatch ? highlightedRef : null}
                  className="w-full flex justify-center"
                >
                  <PlanCard
                    plan={plan}
                    isActive={isActive}
                    isHighlighted={isTargetHighlighted}
                    highlightBadge={
                      isTargetHighlighted && featureName
                        ? `Unlocks ${featureName}`
                        : undefined
                    }
                    actionLabel={
                      t.billing?.pricing?.upgradeTo?.replace(
                        "{{planName}}",
                        plan.name,
                      ) || `Nâng cấp lên ${plan.name}`
                    }
                    isProcessing={isProcessing}
                    onAction={
                      plan.price > 0
                        ? () => handleUpgradeClick(plan)
                        : undefined
                    }
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default PricingPage;
