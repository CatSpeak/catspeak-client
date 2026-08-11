import { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  doc,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  db as firestore,
  auth as firebaseAuth,
} from "@/shared/config/firebase";
import { initFirebaseSession } from "@/shared/config/initFirebaseSession";
import { useAuth } from "@/features/auth";
import { useDispatch } from "react-redux";
import { friendshipApi } from "@/store/api/social/friendshipApi";
import { useLanguage } from "@/shared/context/LanguageContext";
import toast from "react-hot-toast";
import { resolveNotification } from "../config/notificationTypeConfig";

export function useNotifications() {
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { token } = useAuth();
  const { t } = useLanguage();
  const isInitialLoad = useRef(true);

  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    let cancelled = false;
    let unsubList;
    let unsubCount;

    let subscribedUid = null;


    let sessionReady = false;
    let expectedUid = null;

    setNotifications([]);
    setUnreadCount(0);
    isInitialLoad.current = true;

    const cleanupSnapshots = () => {
      unsubList?.();
      unsubCount?.();

      unsubList = undefined;
      unsubCount = undefined;
      subscribedUid = null;
    };

    const subscribeFor = (uid) => {
      if (cancelled || !uid) return;

      if (subscribedUid === uid && unsubList && unsubCount) {
        return;
      }

      cleanupSnapshots();
      subscribedUid = uid;

      const notifRef = collection(firestore, "users", uid, "notifications");

      unsubList = onSnapshot(
        query(notifRef, orderBy("createdAt", "desc"), limit(20)),
        (snapshot) => {
          if (cancelled) return;

          const items = snapshot.docs.map((d) => {
            const raw = {
              id: d.id,
              ...d.data(),
              createdAt: d.data().createdAt?.toDate(),
            };

            return resolveNotification(raw, tRef.current);
          });

          setNotifications(items);

          if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return;
          }

          snapshot.docChanges().forEach((change) => {
            if (change.type !== "added") return;

            const data = change.doc.data();
            const resolved = resolveNotification(
              {
                ...data,
                id: change.doc.id,
              },
              tRef.current,
            );

            const notifType = String(data?.type || "");

            if (notifType.toLowerCase().includes("friend")) {
              const meta = data?.metadata || {};
              const targetId =
                meta.userId ||
                meta.userid ||
                meta.requesterId ||
                meta.RequesterId ||
                meta.responderId ||
                meta.ResponderId ||
                meta.accountId ||
                meta.targetAccountId;

              dispatch(
                friendshipApi.util.invalidateTags([
                  ...(targetId
                    ? [
                        { type: "Friendship", id: targetId },
                        { type: "Friend", id: `LIST-${targetId}` },
                      ]
                    : []),
                  "Friendship",
                  "Friend",
                  "FriendRequest",
                  "Recommendation",
                ]),
              );
            }

            toast.custom(
              (toastObj) => (
                <div
                  onClick={() => {
                    toast.dismiss(toastObj.id);

                    if (!resolved.isRead) {
                      updateDoc(change.doc.ref, { isRead: true });
                    }

                    if (resolved.resolvedUrl) {
                      window.location.href = resolved.resolvedUrl;
                    }
                  }}
                  className="flex cursor-pointer items-start gap-3 rounded-lg bg-white p-4 shadow-lg ring-1 ring-black/5"
                >
                  {resolved.icon && (
                    <resolved.icon
                      className={`mt-0.5 h-5 w-5 shrink-0 ${resolved.color}`}
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {resolved.resolvedTitle ||
                        tRef.current.header?.newNotificationTitle ||
                        "Thông báo mới"}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      {resolved.resolvedBody ||
                        tRef.current.header?.newNotificationBody ||
                        "Bạn có một thông báo mới cần xem."}
                    </p>
                  </div>
                </div>
              ),
              { duration: 5000 },
            );
          });
        },
      );

      unsubCount = onSnapshot(
        query(notifRef, where("isRead", "==", false)),
        (snapshot) => {
          if (cancelled) return;
          setUnreadCount(snapshot.size);
        },
      );
    };

    const unsubAuth = onAuthStateChanged(firebaseAuth, (user) => {
      if (cancelled) return;


      if (!sessionReady) return;

      if (!user) {
        cleanupSnapshots();
        return;
      }

      if (!expectedUid || user.uid !== expectedUid) return;

      subscribeFor(user.uid);
    });

    (async () => {
      const user = await initFirebaseSession(token);

      if (cancelled) return;

      sessionReady = true;
      expectedUid = user?.uid || null;

      if (!user) {
        cleanupSnapshots();
        return;
      }

      subscribeFor(user.uid);
    })();

    return () => {
      cancelled = true;
      sessionReady = false;
      expectedUid = null;
      isInitialLoad.current = true;

      unsubAuth();
      cleanupSnapshots();
    };
  }, [token, dispatch]);

  const markAsRead = async (notificationId) => {
    const user = firebaseAuth.currentUser;
    if (!user) return;
    await updateDoc(
      doc(firestore, "users", user.uid, "notifications", notificationId),
      {
        isRead: true,
      },
    );
  };

  const markAllAsRead = async () => {
    const user = firebaseAuth.currentUser;
    if (!user) return;

    const notifRef = collection(firestore, "users", user.uid, "notifications");
    const unreadQuery = query(notifRef, where("isRead", "==", false));
    const snapshot = await getDocs(unreadQuery);
    if (snapshot.empty) return;

    const batch = writeBatch(firestore);
    snapshot.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, { isRead: true });
    });
    await batch.commit();
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
