import React from 'react'
import colors from '@/shared/utils/colors'

const BubbleChevronRight = ({ className = '', ...rest }) => {
  return (
    <button
      type="button"
      className={['inline-flex items-center justify-center', className].join(' ')}
      {...rest}
    >
      <svg
        width="62"
        height="65"
        viewBox="0 0 62 65"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <foreignObject x="0" y="0" width="68.9062" height="71.5024">
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              backdropFilter: 'blur(3.5px)',
              clipPath: 'url(#bgblur_0_2386_4234_clip_path)',
              height: '100%',
              width: '100%',
            }}
          />
        </foreignObject>
        <g filter="url(#filter0_d_2386_4234)" data-figma-bg-blur-radius="7">
          <path
            d="M8 35.1386C8 22.143 18.535 11.6081 31.5305 11.6081H53.2586C54.254 11.6081 55.061 10.8011 55.061 9.80563C55.061 8.28437 56.8293 7.44728 58.0059 8.41157L60.6531 10.5811C61.4464 11.2311 61.9063 12.2027 61.9063 13.2282V37.5493C61.9063 52.4351 49.5836 64.5024 34.6978 64.5024C20.0914 64.5024 8 52.6616 8 38.0552V35.1386Z"
            fill={colors.primaryRed}
          />
        </g>
        <path
          d="M29.5625 23.4468L41.5279 34.0786C43.7664 36.0676 43.7664 39.5649 41.5279 41.554L29.5625 52.1858"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <defs>
          <filter
            id="filter0_d_2386_4234"
            x="0"
            y="0"
            width="68.9062"
            height="71.5024"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="-4" dy="-4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2386_4234" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_2386_4234"
              result="shape"
            />
          </filter>
          <clipPath id="bgblur_0_2386_4234_clip_path" transform="translate(0 0)">
            <path d="M8 35.1386C8 22.143 18.535 11.6081 31.5305 11.6081H53.2586C54.254 11.6081 55.061 10.8011 55.061 9.80563C55.061 8.28437 56.8293 7.44728 58.0059 8.41157L60.6531 10.5811C61.4464 11.2311 61.9063 12.2027 61.9063 13.2282V37.5493C61.9063 52.4351 49.5836 64.5024 34.6978 64.5024C20.0914 64.5024 8 52.6616 8 38.0552V35.1386Z" />
          </clipPath>
        </defs>
      </svg>
    </button>
  )
}

export default BubbleChevronRight


