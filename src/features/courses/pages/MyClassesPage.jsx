import React from "react"
import MyCoursesPage from "./MyCoursesPage"

const MyClassesPage = () => {
  return (
    <div className="w-full text-slate-900 dark:text-gray-100">
      <MyCoursesPage initialTab="classes" />
    </div>
  )
}

export default MyClassesPage
