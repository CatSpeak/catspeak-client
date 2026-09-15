# Catspeak Calling

The live "room" domain of the Catspeak client: who may run a room, and what a host can do while a session is live.

## Language

**Room**:
A live space people join to talk. It is either a Class Room or a Custom Room.
_Avoid_: Meeting, call

**Class Room**:
A room owned by a teacher for a class.

**Custom Room**:
A long-lived room created by a premium member, with its own membership limits.

**Host**:
The owner/creator of a Room. Holds the full set of moderation powers.
_Avoid_: Owner (when you mean the authority set)

**Co-host**:
A member delegated a subset of the Host's powers inside one Room. Cannot assign other Co-hosts.

**Session**:
One live run of a Room, from the moment it starts until it ends. A Room outlives its Sessions.
_Avoid_: Room (when you mean one run), meeting

## Moderation vocabulary

**Moderation Action**:
A one-shot command a Host fires at the Room or its members. It has no inverse and leaves no on/off state.
_Avoid_: Toggle, setting, policy

**Room Policy**:
A persistent on/off setting of a Room that changes what members may do, and holds until changed.
_Avoid_: Action, command

**Participant Restriction**:
A restriction on one member of a Room — their chat, their voice, or both — that holds until the Host lifts it. Bounded by the Room, not by the session.
_Avoid_: Ban (a heavier power that also blocks re-entry), Mute (a one-shot action that leaves no state)

**Moderation Notice**:
The message a member receives when the Host changes what they may do in a Room — a Moderation Action, a Participant Restriction, or the lifting of one. It reports something done to them, not something they attempted and failed at. Removal from the Room and the end of a live are not Moderation Notices: they end participation rather than limit a capability.
_Avoid_: Error, alert

**Raise Hand**:
A member's signal that they want to speak. A member raises and lowers their own hand.

**Mute All**:
Temporarily mutes every member's microphone. Members may turn it back on themselves.
_Avoid_: Mute all mics (ambiguous with Block All Mics)

**Block All Mics**:
Mutes every member's microphone and stops them turning it back on. One-way and session-scoped.
_Avoid_: Restrict Voice All, Mute all (both ambiguous)

**Camera Off All**:
Turns off every member's camera.

**Lower All Hands**:
Clears the raised-hand signal of every member currently raising a hand.
