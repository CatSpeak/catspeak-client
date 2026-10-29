import { useEffect, useSyncExternalStore } from "react"
import {
  isNetworkFailure,
  isOnlineNow,
  reportNetworkError,
  reportNetworkOk,
  subscribeOnline,
} from "../utils/onlineStatus"

/** true khi có mạng. Cập nhật theo sự kiện trình duyệt và theo kết quả request thật. */
const useOnlineStatus = () => useSyncExternalStore(subscribeOnline, isOnlineNow, () => true)

/**
 * Báo trạng thái mạng từ kết quả một query RTK: lỗi FETCH_ERROR thì chuyển offline,
 * có dữ liệu mới thì chuyển online.
 */
export const useReportQueryNetwork = ({ error, isSuccess, fulfilledTimeStamp } = {}) => {
  useEffect(() => {
    if (isNetworkFailure(error)) reportNetworkError()
  }, [error])
  useEffect(() => {
    if (isSuccess && fulfilledTimeStamp) reportNetworkOk()
  }, [isSuccess, fulfilledTimeStamp])
}

export default useOnlineStatus
