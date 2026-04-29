export default {
  welcome: {
    greeting: "Hi {{name}},",
    friend: "Friend",
    title: "Happy Halloween",
    description: {
      part1: "Halloween is nominally a ",
      highlight1: "Christian holiday",
      part2:
        " honoring the souls of saints and other souls who have been blessed. It descends from an ",
      highlight2: "ancient Celtic festival",
      part3: " of the dead that marked the official end of the growing season.",
    },
    trickOrTreat: "Trick or Treat",
    allowConnect: "Allow connection with international friends",
  },
  specialNames: {
    doYouLikeToGoOut: "Do you like to go out?",
    hskExamPrep: "HSK Exam Prep Room",
    doYouHavePets: "Do you have pets?",
    schoolLife: "School life",
    whatILike: "What I like!",
    doYouLikeReading: "Do you like reading books?",
    aboutLove: "About love",
    genZChineseCulture: "Gen Z Chinese Culture",
    famousPlaces: "Famous Place",
    yourCountryCulture: "Your country's culture",
  },
  heroCarousel: {
    comingSoonTitle: "Coming Soon",
    slides: [],
  },
  filters: {
    title: "Rooms",
    room: "room",
    totalSuffix: "rooms",
    breadcrumb: "Rooms",
    search: "Search",
    searchPlaceholder: "Search",
    topicsAndLevels: "Topics | Levels",
    levelsHeading: "Levels",
    topicsHeading: "Topics",
    roomTypes: {
      twoToFive: "2 : 5",
      saved: "Saved",
      forum: "Forum",
    },
    topics: {
      family: "Family",
      sports: "Sports",
      movies: "Movies",
      travel: "Travel",
      school: "School",
      stuff: "Stuff",
      other: "Other",
    },
    levels: {
      a1: "A1",
      b2: "B2",
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
    },
    categories: {
      random: "Random Connection",
      exam: "Exam Prep",
      friends: "Make Friends",
      trending: "Trending",
      practice: "Exam Prep",
      others: "Others",
      knowledge: "Learn something new",
      culture: "Explore culture and creativity",
      lifestyle: "Enjoy everyday life",
      growth: "Build your future",
      other: "Anything & Everything",
    },
    seeMore: "See more",
    noRoomsFound: "No rooms found for these categories",
    noRoomsFoundCategory:
      "No rooms here yet! Feel free to explore other categories.",
    clear: "Clear",
  },
  tabs: {
    communicate: "Communicate",
    teaching: "Teaching",
    group: "Group",
    class: "Class",
  },
  badge: {
    live: "LIVE NOW",
  },
  joinRoom: {
    title: "Join Room",
  },
  createRoom: {
    title: "What's your room name?",
    namePlaceholder: "e.g. Chill Practice",
    // This tool call only supports file replacement. I will do i18n updates in separate calls or use multiple `replace_file_content` calls serially in my list?
    // I can only do one replacement per tool call for `replace_file_content`.
    // I'll start with updating the Modal to use the structure, and I'll see what label I can use.
    // Actually, I can use "Room Name" hardcoded? No, improper.
    // I will verify the i18n files again.
    // En: `namePlaceholder: "e.g. Chill Practice"`.
    // I'll add `nameLabel` to the i18n files first.

    // Wait, I can't put comments in the replacement.
    // I will start by updating the component to move labels out, using `namePlaceholder` as the label for now (since that was the behavior before, just moved position) to keep it safe, OR better: use `namePlaceholder` as placeholder and "Room Name" as label.
    // Given strict instructions "no custom uis", "barebone mui", "change the label to be outside".
    // Moving "e.g. Chill Practice" to be a label *above* the input seems weird if it's an example.
    // The previous code had: `label={t.rooms.createRoom.namePlaceholder}`.
    // So the floating label was "e.g. Chill Practice".
    // I will follow the pattern.
    // However, standard UI is Label: [Input (placeholder)].
    // I will try to make it nice.
    // `t.rooms.createRoom.title` is "What's your room name?".
    // I'll use "Room name" for the label.
    // I will update i18n files.

    // Step 1: Add `nameLabel` to En, Vi, Zh.
    // Step 2: Update `CreateRoomModal`.

    // I will combine these into the sequence.
    // First En.
    topicsLabel: "Topics",
    nameLabel: "Room name",
    requiredLevel: "Required Level",
    cancel: "Cancel",
    join: "Join Room",
    joining: "Joining...",
    create: "Create Room",
    creating: "Creating...",
    validation: {
      required: "Please enter a room name",
      minLength: "Use at least 3 characters",
    },
    topics: {
      other: "Other",
      history: "History",
      science: "Science",
      philosophy: "Philosophy",
      psychology: "Psychology",
      politics: "Politics",
      space: "Space",
      movies: "Movies",
      music: "Music",
      art: "Art",
      fashion: "Fashion",
      culture: "Culture",
      books: "Books",
      travel: "Travel",
      food: "Food",
      nature: "Nature",
      relationships: "Relationships",
      sports: "Sports",
      finance: "Finance",
      startups: "Startups",
      productivity: "Productivity",
    },
    topicLimit: "Select up to 3 topics",
  },
  chatBox: {
    title: "Room Message",
    empty: "No messages yet",
    you: "You",
    inputPlaceholder: "Type Something...",
    connectingPlaceholder: "Connecting...",
  },
  sessionActions: {
    connect11: "1:1 Connect",
    connect25: "2:5 Connect",
    yourAI: "Your AI",
  },
  queue: {
    title: "Find a Match",
    findMatch: "Find Match",
    cancel: "Cancel",
    connectingToQueue: "Connecting to queue...",
    matchFound: "Match found!",
    waitingForPairing: "Waiting for pairing...",
    error: "Error: {{msg}}",
    socketConnected: "Socket Connected",
    connecting: "Connecting...",
    findingMatch: "We are finding the best match for your level.",
    yourPosition: "Your position:",
    cancelSearch: "Cancel search",
    status: "STATUS",
    position: "POSITION",
    connected: "Connected",
    connecting: "Connecting",
  },
  waitingScreen: {
    backToCommunity: "Back to Community",
    readyToJoin: "Ready to join?",
    micOff: "Mic Off",
    joinNow: "Join now",
    copyLink: "Copy Link",
    linkCopied: "Link copied!",
    joinedAs: "Joined as",
    noOneHere: "No one else is here yet.",
    isHere: "is here",
    loading: "Loading...",
    roomNotFound: "Room not found",
    roomNotFoundSubtext:
      "The room you're looking for doesn't exist or has been closed. Why not explore other active rooms in the community?",
    roomFull: "This room is full (max 5 people).",
    joinError: "Something went wrong joining the room.",
    createSessionError: "Failed to create session. Please try again.",
    cameraAccessError:
      "Cannot access camera. Check permissions or if used by another app.",
    micAccessError:
      "Cannot access microphone. Check permissions or if used by another app.",
    micNotFound: "Microphone hardware not found.",
    cameraNotFound: "Camera hardware not found.",
    micInUse: "Microphone is in use by another app or could not be started.",
    cameraInUse: "Camera is in use by another app or could not be started.",
    micPermissionDenied:
      "Microphone access denied. Please allow it in settings.",
    cameraPermissionDenied:
      "Camera access denied. Please allow it in settings.",
  },
  videoCall: {
    moreOptions: "More options",
    copyLink: "Copy meeting link",
    linkCopied: "Link copied!",
    leaveCall: "Leave call",
    provider: {
      connecting: "Getting your session ready...",
      failedToLoad: "Failed to load session",
      unknownError: "Unknown error occurred",
      retry: "Retry",
    },
    error: {
      micPermission:
        "An error occurred in creating audio track, Unable to initiate audio source. Please verify browser settings for audio permissions.",
      camPermission:
        "An error occurred in creating video track, Unable to initiate video source. Please verify browser settings for video permissions.",
      toggleMic: "Failed to toggle microphone",
      toggleCam: "Failed to toggle camera",
    },
    participantList: {
      title: "Participants",
      you: "You",
      guest: "Guest",
      youSuffix: "(You)",
    },
    webviewBlock: {
      title: "Open in Browser",
      genericApp: "This app",
      description:
        "You're using {app}'s built-in browser, which doesn't support video calls properly.",
      instruction: "How to join:",
      copyLink: "Copy Link",
      copied: "Copied!",
      openInChrome: "Open in Chrome",
      step1: "Copy the link above",
      step2: "Open Chrome or Safari",
      step3: "Paste the link and join the call",
    },
  },
  roomFullModal: {
    title: "Room is full",
    message: "This room has reached the maximum number of participants.",
    subMessage: "Please choose another room or try again later.",
    close: "Close",
  },
  passwordScreen: {
    title: "Private Room",
    description: "This room is private. Enter the password to join.",
    label: "Password",
    placeholder: "Enter room password",
    submit: "Join Room",
    verifying: "Verifying...",
    incorrectPassword: "Incorrect password. Please try again.",
    roomNotFound: "Room not found.",
    genericError: "Something went wrong. Please try again.",
  },
  participants: "participants",
  noLimit: "No limit",
}
