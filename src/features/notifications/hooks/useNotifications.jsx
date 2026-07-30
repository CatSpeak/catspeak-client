import { useEffect, useRef, useState } from "react"
import {
  collection, query, where, orderBy, limit, onSnapshot,
  updateDoc, doc, writeBatch, getDocs
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { db as firestore, auth as firebaseAuth } from "@/shared/config/firebase"
import { initFirebaseSession } from "@/shared/config/initFirebaseSession"
import { useAuth } from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext"
import toast from "react-hot-toast"
import { resolveNotification } from "../config/notificationTypeConfig"

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { token } = useAuth()
  const { t } = useLanguage()
  const isInitialLoad = useRef(true)

  useEffect(() => {
    if (!token) {
      setNotifications([])
      setUnreadCount(0)
      return
    }
    let cancelled = false
    let unsubList, unsubCount

    // Reset state immediately when token changes (account switch)
    setNotifications([])
    setUnreadCount(0)
    isInitialLoad.current = true

    const unsubAuth = onAuthStateChanged(firebaseAuth, async (user) => {
      if (cancelled) return

      if (!user) {
        await initFirebaseSession(token)
        return
      }

      const notifRef = collection(firestore, "users", user.uid, "notifications")
      unsubList = onSnapshot(
        query(notifRef, orderBy("createdAt", "desc"), limit(20)),
        (snapshot) => {
          if (cancelled) return
          const items = snapshot.docs.map((d) => {
            const raw = { id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate() }
            return resolveNotification(raw, t)
          })
          setNotifications(items)

          if (isInitialLoad.current) {
            isInitialLoad.current = false
            return
          }

          snapshot.docChanges().forEach((change) => {
            if (change.type !== "added") return
            const data = change.doc.data()
            const resolved = resolveNotification({ ...data, id: change.doc.id }, t)

            toast.custom(
              (toastObj) => (
                <div
                  onClick={() => {
                    toast.dismiss(toastObj.id)
                    if (!resolved.isRead) {
                      updateDoc(change.doc.ref, { isRead: true })
                    }
                    if (resolved.resolvedUrl) {
                      window.location.href = resolved.resolvedUrl
                    }
                  }}
                  className="flex cursor-pointer items-start gap-3 rounded-lg bg-white p-4 shadow-lg ring-1 ring-black/5"
                >
                  {resolved.icon && <resolved.icon className={`mt-0.5 h-5 w-5 shrink-0 ${resolved.color}`} />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{resolved.resolvedTitle || t.header?.newNotificationTitle || "Thông báo mới"}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{resolved.resolvedBody || t.header?.newNotificationBody || "Bạn có một thông báo mới cần xem."}</p>
                  </div>
                </div>
              ),
              { duration: 5000 },
            )
          })
        }
      )
      unsubCount = onSnapshot(
        query(notifRef, where("isRead", "==", false)),
        (snapshot) => {
          if (cancelled) return
          setUnreadCount(snapshot.size)
        }
      )
    })

    return () => {
      cancelled = true
      isInitialLoad.current = true
      unsubAuth()
      unsubList?.()
      unsubCount?.()
    }
  }, [token, t])

  const markAsRead = async (notificationId) => {
    const user = firebaseAuth.currentUser
    if (!user) return
    await updateDoc(doc(firestore, "users", user.uid, "notifications", notificationId), {
      isRead: true,
    })
  }

  const markAllAsRead = async () => {
    const user = firebaseAuth.currentUser
    if (!user) return

    const notifRef = collection(firestore, "users", user.uid, "notifications")
    const unreadQuery = query(notifRef, where("isRead", "==", false))
    const snapshot = await getDocs(unreadQuery)
    if (snapshot.empty) return

    const batch = writeBatch(firestore)
    snapshot.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, { isRead: true })
    })
    await batch.commit()
  }

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}
