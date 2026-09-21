export const RobotIcon = ({
  size = 22,
  strokeWidth = 2,
  className = "",
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M11 7.33317V3.6665H7.33333"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.5 7.3335H5.5C4.48748 7.3335 3.66667 8.15431 3.66667 9.16683V16.5002C3.66667 17.5127 4.48748 18.3335 5.5 18.3335H16.5C17.5125 18.3335 18.3333 17.5127 18.3333 16.5002V9.16683C18.3333 8.15431 17.5125 7.3335 16.5 7.3335Z"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1.83333 12.8335H3.66667"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.3333 12.8335H20.1667"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.75 11.9165V13.7498"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.25 11.9165V13.7498"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default RobotIcon
