# Create Class frontend changes

## Scope

This implementation is frontend-only, following the clarified request to add the form UI and document API gaps. No backend repository, API contract, or database schema was changed. The initially staged backend work was removed.

Voucher, co-host, and student invitation controls are explicitly labeled as previews. Selecting them does not save a voucher association, assign a co-host, or send invitations. The existing checkout payload and payment redirect remain in use.

## Changes

- Added daily and selected-weekday recurrence controls, repeat intervals, and count/date end conditions. The existing class start date also anchors recurrence.
- Added a calendar/list preview during creation, using the existing schedule preview component. Each local occurrence is converted to UTC separately; invalid calendar dates, invalid ranges, missing/ambiguous DST times, duplicate student IDs, and oversized invitation selections are validated.
- Daily and weekly schedules with an interval of one map to the existing `schedule` and `totalSessions` fields. An inclusive end date calculates the session count. The backend does not retain the chosen end-condition metadata, so editing an existing class shows its saved session count.
- Intervals greater than one can be previewed but cannot be submitted. Classes whose occurrences require different UTC offsets are also blocked from creation because the current API stores a fixed weekly UTC template. Existing class editing remains available.
- Reused `Dropdown`, `InvititeDropdown`, `DatePicker`, `useTimezone`, and the existing vouchers query. Added preview labels in English, Vietnamese, Chinese, and Japanese.
- Preserved the existing edit/recovery flow and server-side conflict checks. No new external writes were introduced.

Preview limits: 500 occurrences, a five-year horizon, interval values from 1 to 52, and up to 50 student selections. A class must start on a selected teaching weekday. Teaching sessions end on the same local day, as in the existing form; their UTC representation may cross midnight.

## API gaps

| Option | Existing support | Gap for Create Class |
| --- | --- | --- |
| Recurrence | A weekly UTC template plus total session count | No interval, local recurring rule, or recurrence end-condition persistence. UTC offsets cannot vary per generated occurrence. |
| Voucher | Voucher list/detail; updating draft vouchers; class scope associations managed after a class exists | Checkout does not accept a voucher association. Draft voucher scope changes require the existing voucher update workflow and a real class ID. |
| Co-host | One co-host per class room, assigned through the existing co-host endpoint | The target must be a confirmed student and the class must have a room. A new class has no confirmed students. No creation-time nomination is supported. |
| Invitations | The existing class invitation endpoint accepts account IDs after creation | Checkout does not accept invitation selections. Invitations need the new class ID. The existing delivery implementation cannot provide durable, exactly-once invitation delivery from frontend code. |
| Checkout completion | The class-opening checkout returns payment ID, checkout URL, and order code | It does not return a reliable new class ID for applying these options after checkout. |

Future integration needs an agreed class-creation contract or a completion flow with a reliable new class ID, server-side option validation, and durable invitation delivery. No such contract or flow was introduced in this change.

## Modified files

- `src/features/courses/pages/CreateClassPage.jsx`
- `src/features/courses/hooks/useClassFormReducer.js`
- `src/features/courses/components/ClassScheduleCalendarPreview.jsx`
- `src/features/courses/components/ClassCreationOptions.jsx` (new)
- `src/features/courses/utils/classRecurrence.js` (new)
- `src/features/courses/utils/classRecurrence.test.js` (new)
- `src/shared/i18n/locales/en/courses.js`
- `src/shared/i18n/locales/vi/courses.js`
- `src/shared/i18n/locales/zh/courses.js`
- `src/shared/i18n/locales/ja/courses.js`
- `docs/create-class-frontend.md` (this report)

The pre-existing `package-lock.json` changes were left untouched.

## Verification

- `node --test src/features/courses/utils/classRecurrence.test.js`: **24 passed**. Covers weekly/daily intervals, inclusive end dates, leap days, UTC date shifts, DST transitions and ambiguous/missing times, invalid ranges, duplicate selections, limits, and blocking schedules the current API cannot represent.
- ESLint on the changed scheduling/form logic: **passed with no errors or warnings**.
- `npm run build`: **passed**; existing bundle-size and dependency warnings remain.
- All frontend Node tests with a temporary alias/asset loader: **212 passed, 3 failed**. The failures are two quiz publish-validation assertions and one submission sanitization assertion in unchanged utilities. Plain Node also lacks the application's alias/asset resolution for these existing test files.
- Repository-wide lint: **545 errors, 79 warnings**, including existing duplicate translation keys and unused variables. All six changed scheduling/form logic files have zero errors and warnings. The new duplicate translation keys found during verification were removed.
- `git diff --check`: **passed**.

There is no standalone type-check script in this JavaScript project. Live authenticated UI interactions and real checkout were not exercised. No migration was created or applied.
