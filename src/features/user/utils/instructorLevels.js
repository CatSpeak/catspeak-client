// Teacher qualifications exclude the three beginner HSK levels.
export const isAllowedInstructorLevel = (name) =>
  Boolean(name) && !/^HSK[\s_-]*[123]$/i.test(String(name).trim())
