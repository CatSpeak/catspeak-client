import React from 'react'
import colors from '@/shared/utils/colors'

const BubbleChevronLeft = ({ className = '', ...rest }) => {
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
        <foreignObject x="-7" y="-7" width="68.9062" height="71.5024">
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              backdropFilter: 'blur(3.5px)',
              clipPath: 'url(#bgblur_0_2386_4235_clip_path)',
              height: '100%',
              width: '100%',
            }}
          />
        </foreignObject>
        <g filter="url(#filter0_d_2386_4235)" data-figma-bg-blur-radius="7">
          <path
            d="M53.9063 29.3639C53.9062 42.3594 43.3713 52.8944 30.3757 52.8944L8.64766 52.8944C7.65221 52.8944 6.84523 53.7014 6.84523 54.6968C6.84523 56.2181 5.0769 57.0552 3.9003 56.0909L1.25312 53.9214C0.459896 53.2713 0 52.2998 0 51.2742L0 26.9531C0 12.0673 12.3227 0 27.2085 0C41.8149 0 53.9063 11.8408 53.9063 26.4472V29.3639Z"
            fill={colors.primaryRed}
          />
        </g>
        <path
          d="M32.3438 41.0557L20.3784 30.4238C18.1398 28.4348 18.1399 24.9375 20.3784 22.9485L32.3438 12.3167"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <defs>
          <filter
            id="filter0_d_2386_4235"
            x="-7"
            y="-7"
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
            <feOffset dx="4" dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2386_4235" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_2386_4235"
              result="shape"
            />
          </filter>
          <clipPath id="bgblur_0_2386_4235_clip_path" transform="translate(7 7)">
            <path d="M53.9063 29.3639C53.9062 42.3594 43.3713 52.8944 30.3757 52.8944L8.64766 52.8944C7.65221 52.8944 6.84523 53.7014 6.84523 54.6968C6.84523 56.2181 5.0769 57.0552 3.9003 56.0909L1.25312 53.9214C0.459896 53.2713 0 52.2998 0 51.2742L0 26.9531C0 12.0673 12.3227 0 27.2085 0C41.8149 0 53.9063 11.8408 53.9063 26.4472V29.3639Z" />
          </clipPath>
        </defs>
      </svg>
    </button>
  )
}

export default BubbleChevronLeft


