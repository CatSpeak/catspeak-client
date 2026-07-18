import React from "react"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import RoomCard from "../RoomCard"
import EmptyRoomState from "../EmptyRoomState"
import { useLanguage } from "@/shared/context/LanguageContext"
import { categoryFriendlyNames } from "../../config/communicateTabConfig"
import RoomPagination from "../navigation/RoomPagination"

const FilteredRoomsView = ({
  rooms,
  selectedCategories,
  page,
  totalPages,
  setPage,
  onBackToOverview,
}) => {
  const { t } = useLanguage()

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Breadcrumb
          items={[
            {
              label: t.rooms.filters.breadcrumb,
              onClick: onBackToOverview,
            },
            ...(selectedCategories && selectedCategories.length > 0
              ? [
                  {
                    label: selectedCategories
                      .map((catKey) => {
                        const lowerKey = catKey.toLowerCase()
                        return (
                          t.rooms.filters.categories?.[lowerKey] ||
                          t.rooms.filters.categories?.others ||
                          categoryFriendlyNames[catKey] ||
                          catKey
                        )
                      })
                      .join(", "),
                  },
                ]
              : []),
          ]}
        />
      </div>

      {rooms.length > 0 ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rooms.map((room) => (
              <div key={room.roomId} className="w-full">
                <RoomCard room={room} />
              </div>
            ))}
          </div>
          
          <RoomPagination 
            page={page} 
            totalPages={totalPages} 
            setPage={setPage} 
          />
        </div>
      ) : (
        <EmptyRoomState message={t.rooms.filters.noRoomsFound} />
      )}
    </div>
  )
}

export default FilteredRoomsView
