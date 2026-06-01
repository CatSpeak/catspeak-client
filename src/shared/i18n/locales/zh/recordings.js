export default {
  title: "录音",
  refresh: "刷新",
  storage: {
    title: "存储空间",
    used: "{{used}} / {{limit}} MB",
    percentUsed: "已使用 {{percent}}%",
    limit_used: "/ {{limit}} 已使用",
    quotaExceeded: "存储空间已满 — 请删除一些录音以释放空间",
    warningAlmostFull: "存储空间即将装满。如果超过限制，录制可能会自动停止。",
    warningLimitReached: "由于超过存储空间限制，录制已自动停止。部分录制已被保存。",
  },
  errors: {
    noRoom: "没有活跃的房间 — 无法录制。",
    noEgress: "录制已开始，但未收到出口 ID — 停止录制可能无法正常工作。",
    noMedia: "请在录制前开启您的摄像头、麦克风或共享屏幕。",
    interrupted: "上一次录制被中断。部分录制文件已被保存。",
    disconnected: "连接中断。录制已暂停...",
  },
  list: {
    emptyTitle: "暂无录音",
    emptyDescription: "当您录制通话时，它们将显示在这里。",
    count_one: "1 个录音",
    count_other: "{{count}} 个录音",
    fileUnavailable: "文件不可用 — 录音可能仍在处理中",
    error: "加载录音失败。",
    retry: "重试"
  },
  status: {
    completed: "已完成",
    failed: "失败",
    partialCompleted: "部分完成"
  },
  player: {
    title: "录音",
    videoNotAvailable: "视频文件不可用。",
    urlExpiry: "链接在 60 分钟后失效",
    meetingIdFallback: "录音 #{{id}}"
  },
  deleteModal: {
    title: "删除录音？",
    description: "此操作将永久删除该录音",
    cannotUndo: "此操作无法撤销。",
    cancel: "取消",
    confirm: "删除",
    deleting: "正在删除…"
  },
  actions: {
    play: "播放录音",
    playUnavailable: "文件不可用",
    download: "下载录音",
    downloadUnavailable: "文件不可用",
    delete: "删除录音",
    startSuccess: "录音已开始",
    stopSuccess: "录音已停止 — 正在上传处理…",
    deleteSuccess: "录音已删除",
    deleteFailed: "无法删除录音。",
    viewRecordings: "查看录音",
    reconnected: "连接已恢复。录制继续进行。",
  }
}
