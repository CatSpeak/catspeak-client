import React from 'react'
import ScreenShareTile from "../ScreenShareTile"
import VideoTile from "../VideoTile"

const PiPLayout = ({ spotlightItem, screenShareTracks, participants, handleTileClick }) => {
    const allItems = [
        ...(screenShareTracks || []).map((t) => ({
            type: "screen",
            data: t,
            // eslint-disable-next-line react-hooks/purity
            key: t.publication?.trackSid || Math.random(),
        })),
        ...(participants || []).map((p) => ({
            type: "video",
            data: p,
            key: p.identity,
        })),
    ]

    // Fallback just in case
    if (allItems.length !== 2) return null;

    // Determine which item goes to the background (main) and which is floating (PiP)
    let mainItem = allItems[0];
    let pipItem = allItems[1];

    if (spotlightItem) {
        const isSpotlightVideo = spotlightItem.type === "video";
        const spotIndex = allItems.findIndex(i =>
            isSpotlightVideo
                ? i.type === "video" && i.data.identity === spotlightItem.participant?.identity
                : i.type === "screen" && i.data.publication?.trackSid === spotlightItem.trackRef?.publication?.trackSid
        );

        if (spotIndex !== -1) {
            mainItem = allItems[spotIndex];
            pipItem = allItems[spotIndex === 0 ? 1 : 0];
        }
    } else {
        // Fallback if no spotlightItem is passed
        const localIndex = allItems.findIndex(i => i.type === "video" && i.data.isLocal);
        if (localIndex !== -1) {
            pipItem = allItems[localIndex];
            mainItem = allItems[localIndex === 0 ? 1 : 0];
        }
    }

    const renderItem = (item) => {
        if (item.type === "screen") {
            return (
                <ScreenShareTile
                    trackRef={item.data}
                    presenterDisplayName={item.data.participant?.name || item.data.participant?.identity || "Unknown"}
                    isLocal={item.data.participant?.isLocal}
                    onClick={() => handleTileClick({ type: "screen", trackRef: item.data })}
                />
            )
        } else {
            return (
                <VideoTile
                    participant={item.data}
                    onClick={() => handleTileClick({ type: "video", participant: item.data })}
                />
            )
        }
    }

    return (
        <div className="relative h-full w-full bg-black overflow-hidden">
            {/* Main Background Video */}
            <div className="absolute inset-0 w-full h-full">
                {renderItem(mainItem)}
            </div>

            {/* Floating PiP Video */}
            <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-[120px] h-[160px] md:w-[240px] md:h-[135px] rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 z-10 transition-transform hover:scale-105 cursor-pointer">
                {renderItem(pipItem)}
            </div>
        </div>
    )
}

export default PiPLayout