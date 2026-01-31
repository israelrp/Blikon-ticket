import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import QRCode from 'react-qr-code'
import { AnimatePresence, motion } from 'framer-motion'
import { useRive } from 'rive-react'
import type { GenericTicketDetailsData } from '../types/ticket'
import { downloadTicket } from '../services/ticketService'

interface GenericTicketDetailsProps {
  ticketDetails: GenericTicketDetailsData
  isLoading?: boolean
  loadError?: boolean
}

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number
  color?: string
  weight?: string
}

const CalendarIcon = ({ size = 16, color = '#6C757D' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="16" rx="3" stroke={color} strokeWidth="1.6" />
    <path d="M7 3V7M17 3V7M3 9H21" stroke={color} strokeWidth="1.6" />
  </svg>
)

const CaretDownIcon = ({ size = 12, color = '#6C757D' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 9L12 15L18 9" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const CheckCircleIcon = ({ size = 10, color = '#2CA824', weight = 'bold' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={weight === 'fill' ? '0' : '2'} fill={weight === 'fill' ? color : 'none'} />
    <path d="M8 12L11 15L16 9" stroke={weight === 'fill' ? 'white' : color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const ClockIcon = ({ size = 10, color = '#BEA51A' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <path d="M12 7V12L15 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const CurrencyDollarIcon = ({ size = 16, color = '#6C757D' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const DownloadSimpleIcon = ({ size = 14, color = '#ADB5BD' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 4V14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M8 10L12 14L16 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M4 18H20" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const ExportIcon = ({ size = 14, color = '#6C757D' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 4V14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M8 8L12 4L16 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M5 14V18H19V14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const HeadsetIcon = ({ size = 12, color = '#6C757D' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 12V17C4 18.1 4.9 19 6 19H7" stroke={color} strokeWidth="1.6" />
    <path d="M20 12V17C20 18.1 19.1 19 18 19H17" stroke={color} strokeWidth="1.6" />
    <path d="M4 12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12" stroke={color} strokeWidth="1.6" />
  </svg>
)

const QrCodeIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <g clipPath="url(#clip0_1995_2803)">
      <path d="M5.81818 0H1.45455C1.06878 0 0.698807 0.153246 0.426026 0.426026C0.153246 0.698807 0 1.06878 0 1.45455V5.81818C0 6.20395 0.153246 6.57392 0.426026 6.8467C0.698807 7.11948 1.06878 7.27273 1.45455 7.27273H5.81818C6.20395 7.27273 6.57392 7.11948 6.8467 6.8467C7.11948 6.57392 7.27273 6.20395 7.27273 5.81818V1.45455C7.27273 1.06878 7.11948 0.698807 6.8467 0.426026C6.57392 0.153246 6.20395 0 5.81818 0ZM5.81818 5.81818H1.45455V1.45455H5.81818V5.81818ZM5.81818 8.72727H1.45455C1.06878 8.72727 0.698807 8.88052 0.426026 9.1533C0.153246 9.42608 0 9.79605 0 10.1818V14.5455C0 14.9312 0.153246 15.3012 0.426026 15.574C0.698807 15.8468 1.06878 16 1.45455 16H5.81818C6.20395 16 6.57392 15.8468 6.8467 15.574C7.11948 15.3012 7.27273 14.9312 7.27273 14.5455V10.1818C7.27273 9.79605 7.11948 9.42608 6.8467 9.1533C6.57392 8.88052 6.20395 8.72727 5.81818 8.72727ZM5.81818 14.5455H1.45455V10.1818H5.81818V14.5455ZM14.5455 0H10.1818C9.79605 0 9.42608 0.153246 9.1533 0.426026C8.88052 0.698807 8.72727 1.06878 8.72727 1.45455V5.81818C8.72727 6.20395 8.88052 6.57392 9.1533 6.8467C9.42608 7.11948 9.79605 7.27273 10.1818 7.27273H14.5455C14.9312 7.27273 15.3012 7.11948 15.574 6.8467C15.8468 6.57392 16 6.20395 16 5.81818V1.45455C16 1.06878 15.8468 0.698807 15.574 0.426026C15.3012 0.153246 14.9312 0 14.5455 0ZM14.5455 5.81818H10.1818V1.45455H14.5455V5.81818ZM8.72727 12.3636V9.45455C8.72727 9.26166 8.8039 9.07668 8.94029 8.94029C9.07668 8.8039 9.26166 8.72727 9.45455 8.72727C9.64743 8.72727 9.83242 8.8039 9.96881 8.94029C10.1052 9.07668 10.1818 9.26166 10.1818 9.45455V12.3636C10.1818 12.5565 10.1052 12.7415 9.96881 12.8779C9.83242 13.0143 9.64743 13.0909 9.45455 13.0909C9.26166 13.0909 9.07668 13.0143 8.94029 12.8779C8.8039 12.7415 8.72727 12.5565 8.72727 12.3636ZM16 10.9091C16 11.102 15.9234 11.287 15.787 11.4234C15.6506 11.5597 15.4656 11.6364 15.2727 11.6364H13.0909V15.2727C13.0909 15.4656 13.0143 15.6506 12.8779 15.787C12.7415 15.9234 12.5565 16 12.3636 16H9.45455C9.26166 16 9.07668 15.9234 8.94029 15.787C8.8039 15.6506 8.72727 15.4656 8.72727 15.2727C8.72727 15.0798 8.8039 14.8949 8.94029 14.7585C9.07668 14.6221 9.26166 14.5455 9.45455 14.5455H11.6364V9.45455C11.6364 9.26166 11.713 9.07668 11.8494 8.94029C11.9858 8.8039 12.1708 8.72727 12.3636 8.72727C12.5565 8.72727 12.7415 8.8039 12.8779 8.94029C13.0143 9.07668 13.0909 9.26166 13.0909 9.45455V10.1818H15.2727C15.4656 10.1818 15.6506 10.2584 15.787 10.3948C15.9234 10.5312 16 10.7162 16 10.9091ZM16 13.8182V15.2727C16 15.4656 15.9234 15.6506 15.787 15.787C15.6506 15.9234 15.4656 16 15.2727 16C15.0798 16 14.8949 15.9234 14.7585 15.787C14.6221 15.6506 14.5455 15.4656 14.5455 15.2727V13.8182C14.5455 13.6253 14.6221 13.4403 14.7585 13.3039C14.8949 13.1675 15.0798 13.0909 15.2727 13.0909C15.4656 13.0909 15.6506 13.1675 15.787 13.3039C15.9234 13.4403 16 13.6253 16 13.8182Z" fill="#1B1F26" fillOpacity="0.72"/>
    </g>
    <defs>
      <clipPath id="clip0_1995_2803">
        <rect width="16" height="16" fill="white"/>
      </clipPath>
    </defs>
  </svg>
)

const HelpIcon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <g clipPath="url(#clip0_32_715)">
      <mask id="mask0_32_715" maskUnits="userSpaceOnUse" x="0" y="0" width="18" height="18">
        <path d="M17.144 0.921387H0V17.0704H17.144V0.921387Z" fill="white"/>
      </mask>
      <g mask="url(#mask0_32_715)">
        <path d="M4.69998 17.0704C4.60201 17.0756 4.50413 17.0585 4.41371 17.0204C4.3233 16.9823 4.2427 16.9242 4.17798 16.8504C4.04655 16.6839 3.9801 16.4753 3.99098 16.2634V14.0304H3.55398C2.88925 14.0497 2.22995 13.9055 1.63398 13.6104C1.11314 13.3392 0.689046 12.9134 0.419984 12.3914C0.124241 11.7886 -0.0199286 11.1226 -1.58135e-05 10.4514V4.50843C-0.0195068 3.83642 0.123186 3.16961 0.415984 2.56443C0.68284 2.03953 1.10785 1.61173 1.63098 1.34143C2.2365 1.0451 2.90516 0.900938 3.57898 0.921431H13.565C14.2419 0.900379 14.9136 1.04598 15.521 1.34543C16.0425 1.61662 16.466 2.04429 16.732 2.56843C17.0222 3.17294 17.1635 3.83815 17.144 4.50843V10.4514C17.1635 11.1217 17.0222 11.7869 16.732 12.3914C16.4666 12.915 16.0428 13.3416 15.521 13.6104C14.9128 13.9073 14.2414 14.0515 13.565 14.0304H8.42098L5.60898 16.5734C5.46373 16.7162 5.30385 16.8432 5.13198 16.9524C5.00013 17.0308 4.84936 17.0716 4.69598 17.0704M7.28298 11.6014H10.283C10.4316 11.6047 10.5754 11.549 10.683 11.4464C10.7364 11.3947 10.7784 11.3324 10.8063 11.2636C10.8342 11.1947 10.8474 11.1207 10.845 11.0464C10.8454 10.9752 10.8312 10.9047 10.8034 10.8392C10.7755 10.7737 10.7345 10.7145 10.683 10.6654C10.6307 10.6128 10.5684 10.5712 10.4996 10.5434C10.4308 10.5156 10.3572 10.502 10.283 10.5034H9.41998V6.89143C9.42977 6.70635 9.37498 6.52361 9.26498 6.37443C9.20905 6.30902 9.1386 6.25759 9.05925 6.22425C8.9799 6.19091 8.89385 6.17659 8.80798 6.18243H7.40798C7.33291 6.18049 7.25819 6.19345 7.18816 6.22057C7.11813 6.24769 7.05417 6.28843 6.99998 6.34043C6.94628 6.3904 6.90373 6.45115 6.87512 6.5187C6.84651 6.58626 6.8325 6.65909 6.83398 6.73243C6.83212 6.80701 6.84593 6.88115 6.87453 6.95005C6.90312 7.01895 6.94586 7.08109 6.99998 7.13243C7.05361 7.18548 7.11738 7.22716 7.18748 7.255C7.25758 7.28283 7.33258 7.29624 7.40798 7.29443H8.16998V10.4994H7.28298C7.20758 10.4976 7.13258 10.511 7.06248 10.5389C6.99238 10.5667 6.92861 10.6084 6.87498 10.6614C6.82241 10.71 6.78051 10.7689 6.75193 10.8345C6.72335 10.9001 6.70873 10.9709 6.70898 11.0424C6.70668 11.1171 6.72029 11.1913 6.74891 11.2603C6.77753 11.3293 6.82051 11.3914 6.87498 11.4424C6.98533 11.5457 7.1319 11.6014 7.28298 11.5974M8.52898 4.99743C8.65964 4.99943 8.78929 4.97434 8.90977 4.92374C9.03025 4.87314 9.13894 4.79813 9.22898 4.70343C9.32308 4.61099 9.3974 4.50038 9.44743 4.37833C9.49745 4.25627 9.52214 4.12532 9.51998 3.99343C9.52184 3.86252 9.49761 3.73255 9.44871 3.61111C9.3998 3.48966 9.3272 3.37917 9.23514 3.28609C9.14307 3.193 9.03339 3.11918 8.9125 3.06893C8.7916 3.01869 8.66191 2.99302 8.53098 2.99343C8.4 2.99095 8.26988 3.01511 8.14852 3.06445C8.02716 3.11378 7.91709 3.18726 7.82498 3.28043C7.73012 3.3723 7.65529 3.4828 7.60521 3.60499C7.55513 3.72718 7.53088 3.85841 7.53398 3.99043C7.53177 4.12233 7.55643 4.2533 7.60646 4.37536C7.65649 4.49742 7.73084 4.60803 7.82498 4.70043C7.91605 4.79544 8.02578 4.87059 8.14727 4.92119C8.26876 4.97178 8.3994 4.99672 8.53098 4.99443" fill="black"/>
      </g>
    </g>
    <defs>
      <clipPath id="clip0_32_715">
        <rect width="17.144" height="16.149" fill="white" transform="translate(0 0.921387)"/>
      </clipPath>
    </defs>
  </svg>
)

const TicketDetailsIcon = () => (
  <svg width="31" height="29" viewBox="0 0 31 29" fill="none">
    <g mask="url(#mask0_81_229)">
      <path d="M21.2501 6.42708C21.2501 6.2801 21.2211 6.13455 21.1648 5.99878C21.1085 5.86301 21.0259 5.73967 20.9219 5.63583C20.8179 5.53199 20.6944 5.44968 20.5585 5.39361C20.4226 5.33754 20.2771 5.30882 20.1301 5.30908H10.0481C9.75156 5.30908 9.46719 5.42687 9.25752 5.63654C9.04786 5.8462 8.93007 6.13057 8.93007 6.42708V7.38308C8.93007 7.41708 8.93007 7.45008 8.93507 7.48308C8.93507 7.53508 8.93007 7.58308 8.93007 7.63908V23.1771C8.92612 23.2473 8.93789 23.3175 8.96454 23.3825C8.99118 23.4476 9.03202 23.5058 9.08407 23.5531C9.20163 23.648 9.35017 23.6961 9.50107 23.6881C9.62503 23.6889 9.74694 23.6565 9.85407 23.5941C10.0213 23.4897 10.1819 23.3751 10.3351 23.2511L12.2301 21.7681C12.2422 21.7577 12.2576 21.752 12.2736 21.752C12.2895 21.752 12.3049 21.7577 12.3171 21.7681L14.2061 23.2501C14.361 23.3731 14.5226 23.4876 14.6901 23.5931C14.7961 23.6555 14.917 23.688 15.0401 23.6871C15.0571 23.6871 15.0721 23.6871 15.0881 23.6871C15.1041 23.6871 15.1181 23.6871 15.1351 23.6871C15.259 23.6879 15.3809 23.6555 15.4881 23.5931C15.6553 23.4887 15.8159 23.3741 15.9691 23.2501L17.8631 21.7681C17.8753 21.7575 17.8909 21.7516 17.9071 21.7516C17.9232 21.7516 17.9389 21.7575 17.9511 21.7681L19.8401 23.2501C19.995 23.3731 20.1566 23.4876 20.3241 23.5931C20.43 23.6556 20.551 23.6881 20.6741 23.6871C20.8266 23.6957 20.9769 23.6476 21.0961 23.5521C21.1483 23.5049 21.1893 23.4467 21.2161 23.3816C21.243 23.3166 21.2549 23.2463 21.2511 23.1761V7.63808C21.2511 7.58408 21.2511 7.53808 21.2461 7.48208C21.2461 7.44908 21.2511 7.41608 21.2511 7.38208L21.2501 6.42708ZM15.3161 14.5451C15.2714 14.5895 15.2181 14.6243 15.1594 14.6473C15.1008 14.6704 15.038 14.6812 14.9751 14.6791H12.3011C12.2381 14.6811 12.1754 14.6703 12.1167 14.6472C12.0581 14.6242 12.0048 14.5894 11.9601 14.5451C11.9175 14.5026 11.884 14.4518 11.8616 14.396C11.8393 14.3401 11.8285 14.2802 11.8301 14.2201C11.8277 14.1571 11.8383 14.0942 11.8614 14.0355C11.8844 13.9768 11.9193 13.9235 11.9639 13.8789C12.0085 13.8343 12.0618 13.7994 12.1205 13.7764C12.1792 13.7534 12.242 13.7427 12.3051 13.7451H14.9751C15.038 13.7428 15.1008 13.7536 15.1595 13.7767C15.2181 13.7998 15.2714 13.8347 15.3159 13.8792C15.3605 13.9238 15.3954 13.9771 15.4185 14.0357C15.4415 14.0943 15.4523 14.1571 15.4501 14.2201C15.4512 14.2807 15.4398 14.3409 15.4168 14.397C15.3938 14.453 15.3595 14.5038 15.3161 14.5461M18.2241 11.9521C18.1803 11.9969 18.1278 12.0322 18.0698 12.0559C18.0119 12.0797 17.9497 12.0913 17.8871 12.0901H12.3011C12.2378 12.092 12.1747 12.0808 12.116 12.057C12.0573 12.0332 12.0042 11.9975 11.9601 11.9521C11.9171 11.9074 11.8834 11.8546 11.8611 11.7967C11.8388 11.7388 11.8282 11.6771 11.8301 11.6151C11.8284 11.5548 11.8391 11.4947 11.8615 11.4387C11.8838 11.3826 11.9174 11.3317 11.9601 11.2891C12.0048 11.2447 12.0581 11.21 12.1167 11.1869C12.1754 11.1639 12.2381 11.153 12.3011 11.1551H17.8871C17.9493 11.1538 18.0113 11.1649 18.0691 11.188C18.127 11.211 18.1797 11.2454 18.2241 11.2891C18.2685 11.3308 18.3037 11.3814 18.3275 11.4375C18.3512 11.4937 18.363 11.5541 18.3621 11.6151C18.3633 11.6777 18.3517 11.7399 18.3279 11.7979C18.3042 11.8558 18.2688 11.9083 18.2241 11.9521ZM18.2241 9.36208C18.1803 9.40686 18.1278 9.4422 18.0698 9.46593C18.0119 9.48967 17.9497 9.50129 17.8871 9.50008H12.3011C12.2378 9.50202 12.1747 9.49076 12.116 9.467C12.0573 9.44324 12.0042 9.40751 11.9601 9.36208C11.917 9.31742 11.8833 9.2646 11.861 9.20672C11.8387 9.14885 11.8282 9.08709 11.8301 9.02508C11.8285 8.96338 11.8396 8.90201 11.8627 8.84475C11.8857 8.78748 11.9202 8.73553 11.9641 8.69208C12.0088 8.64768 12.0621 8.61288 12.1207 8.58984C12.1794 8.56679 12.2421 8.55599 12.3051 8.55808H17.8871C17.9494 8.55671 18.0113 8.56786 18.0692 8.59088C18.1271 8.61389 18.1797 8.64831 18.2241 8.69208C18.269 8.73493 18.3044 8.78668 18.3282 8.84402C18.352 8.90136 18.3635 8.96303 18.3621 9.02508C18.3633 9.08771 18.3517 9.14992 18.328 9.20789C18.3043 9.26585 18.2689 9.31833 18.2241 9.36208Z" fill="#6E6E6E"/>
    </g>
  </svg>
)

const MoneyBillIcon = () => (
  <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
    <path d="M19 0H1C0.447812 0 0 0.447812 0 1V11C0 11.5522 0.447812 12 1 12H19C19.5522 12 20 11.5522 20 11V1C20 0.447812 19.5522 0 19 0ZM1.5 10.5V8.5C2.60469 8.5 3.5 9.39531 3.5 10.5H1.5ZM1.5 3.5V1.5H3.5C3.5 2.60469 2.60469 3.5 1.5 3.5ZM10 9C8.61906 9 7.5 7.65656 7.5 6C7.5 4.34312 8.61938 3 10 3C11.3806 3 12.5 4.34312 12.5 6C12.5 7.65719 11.3803 9 10 9ZM18.5 10.5H16.5C16.5 9.39531 17.3953 8.5 18.5 8.5V10.5ZM18.5 3.5C17.3953 3.5 16.5 2.60469 16.5 1.5H18.5V3.5Z" fill="#6E6E6E"/>
  </svg>
)

const PhoneIcon = () => (
  <svg width="16" height="26" viewBox="0 0 16 26" fill="none">
    <g clipPath="url(#clip0_32_1193)">
      <path d="M14.427 0.820231C14.1154 0.534249 13.7494 0.313913 13.3508 0.17235C12.9522 0.0307864 12.5293 -0.029109 12.107 -0.00376858H3.66403C3.23977 -0.0299061 2.8146 0.0295751 2.41381 0.171135C2.01301 0.312694 1.64478 0.533439 1.33104 0.820231C1.04427 1.12488 0.822666 1.48483 0.679782 1.87807C0.536897 2.2713 0.47573 2.68955 0.500033 3.10723V22.2532C0.474603 22.6719 0.535227 23.0914 0.678149 23.4858C0.821071 23.8801 1.04327 24.241 1.33104 24.5462C1.6457 24.8313 2.01421 25.0505 2.41487 25.191C2.81554 25.3315 3.24026 25.3904 3.66403 25.3642H12.107C12.5288 25.3895 12.9513 25.3302 13.3497 25.1897C13.7481 25.0492 14.1144 24.8304 14.427 24.5462C14.7148 24.241 14.9369 23.8801 15.0799 23.4857C15.2228 23.0914 15.2834 22.6719 15.258 22.2532V3.10723C15.2822 2.68956 15.221 2.27134 15.0781 1.87813C14.9352 1.48491 14.7137 1.12495 14.427 0.820231ZM13.998 22.1062C14.0207 22.3799 13.9877 22.6554 13.9009 22.916C13.8141 23.1766 13.6754 23.4168 13.493 23.6222C13.0679 23.9809 12.5186 24.1577 11.964 24.1142H3.79804C3.24109 24.1601 2.68869 23.9832 2.26204 23.6222C2.08145 23.4159 1.94414 23.1754 1.85825 22.915C1.77236 22.6545 1.73965 22.3795 1.76204 22.1062V3.25323C1.73965 2.97993 1.77236 2.70492 1.85825 2.44451C1.94414 2.1841 2.08145 1.94358 2.26204 1.73723C2.68884 1.37666 3.24122 1.20008 3.79804 1.24623H5.31404C5.35018 1.24105 5.38703 1.24435 5.42166 1.25588C5.4563 1.26742 5.48778 1.28686 5.5136 1.31268C5.53941 1.33849 5.55886 1.36997 5.57039 1.40461C5.58192 1.43924 5.58522 1.47609 5.58003 1.51223V1.69623C5.57149 1.89391 5.64078 2.08706 5.77304 2.23423C5.84088 2.30392 5.92279 2.35834 6.01332 2.39386C6.10385 2.42938 6.20091 2.44519 6.29804 2.44023H9.47605C9.57198 2.44394 9.66763 2.42752 9.75684 2.39205C9.84605 2.35657 9.92685 2.30281 9.99404 2.23423C10.0615 2.16236 10.1139 2.07776 10.1482 1.98538C10.1826 1.893 10.1981 1.7947 10.194 1.69623V1.51223C10.194 1.3349 10.2784 1.24623 10.447 1.24623H11.963C12.5176 1.20279 13.0669 1.37955 13.492 1.73823C13.6743 1.94365 13.8131 2.18391 13.8999 2.44448C13.9867 2.70505 14.0197 2.98052 13.997 3.25423L13.998 22.1062Z" fill="#007AFF"/>
      <g opacity="0.1">
        <mask id="mask0_32_1193" maskUnits="userSpaceOnUse" x="1" y="1" width="13" height="24">
          <path d="M13.9949 1.24609H1.76294V24.1141H13.9949V1.24609Z" fill="white"/>
        </mask>
        <g mask="url(#mask0_32_1193)">
          <path d="M3.79691 24.1139H11.9599C12.5145 24.1573 13.0638 23.9806 13.4889 23.6219C13.6712 23.4165 13.81 23.1762 13.8968 22.9156C13.9836 22.6551 14.0166 22.3796 13.9939 22.1059V3.2539C14.0166 2.98019 13.9836 2.70472 13.8968 2.44415C13.81 2.18358 13.6712 1.94332 13.4889 1.7379C13.0638 1.37922 12.5145 1.20246 11.9599 1.2459H10.4439C10.2752 1.2459 10.1909 1.33456 10.1909 1.5119V1.6979C10.195 1.79637 10.1795 1.89467 10.1451 1.98705C10.1108 2.07943 10.0584 2.16403 9.99091 2.2359C9.92368 2.30443 9.84289 2.35815 9.75368 2.39362C9.66448 2.4291 9.56885 2.44554 9.47292 2.4419H6.29592C6.1988 2.44686 6.10174 2.43105 6.01121 2.39552C5.92068 2.36 5.83876 2.30558 5.77093 2.2359C5.63867 2.08873 5.56937 1.89558 5.57792 1.6979V1.5119C5.5831 1.47576 5.57981 1.43891 5.56827 1.40427C5.55674 1.36963 5.53728 1.33816 5.51147 1.31234C5.48565 1.28653 5.45418 1.26708 5.41955 1.25555C5.38491 1.24402 5.34806 1.24071 5.31193 1.2459H3.79592C3.23897 1.20002 2.68657 1.37696 2.25992 1.7379C2.07929 1.94422 1.94195 2.18473 1.85605 2.44515C1.77016 2.70557 1.73747 2.9806 1.75992 3.2539V22.1069C1.73747 22.3802 1.77016 22.6552 1.85605 22.9156C1.94195 23.1761 2.07929 23.4166 2.25992 23.6229C2.68657 23.9838 3.23897 24.1608 3.79592 24.1149" fill="#007AFF"/>
        </g>
      </g>
      <path d="M5.32605 23.2503C5.2672 23.2514 5.20871 23.2407 5.15397 23.2191C5.09923 23.1975 5.0493 23.1653 5.00705 23.1243C4.9641 23.0846 4.93005 23.0363 4.90713 22.9826C4.88421 22.9288 4.87293 22.8708 4.87405 22.8123C4.8719 22.7517 4.88263 22.6912 4.90556 22.635C4.92849 22.5788 4.96308 22.5281 5.00705 22.4863C5.04927 22.4453 5.09919 22.413 5.15394 22.3914C5.20869 22.3698 5.26719 22.3592 5.32605 22.3603H10.445C10.5041 22.3576 10.5631 22.3674 10.6181 22.3891C10.6731 22.4108 10.7228 22.4439 10.764 22.4863C10.8457 22.5748 10.8888 22.692 10.884 22.8123C10.887 22.9281 10.8438 23.0403 10.764 23.1243C10.7228 23.1666 10.673 23.1997 10.618 23.2214C10.563 23.2432 10.5041 23.253 10.445 23.2503H5.32605Z" fill="#007AFF"/>
    </g>
    <defs>
      <clipPath id="clip0_32_1193">
        <rect width="14.758" height="25.368" fill="white" transform="translate(0.5 -0.00390625)"/>
      </clipPath>
    </defs>
  </svg>
)

const TimelineDotIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12ZM2.4 12C2.4 17.3019 6.69807 21.6 12 21.6C17.3019 21.6 21.6 17.3019 21.6 12C21.6 6.69807 17.3019 2.4 12 2.4C6.69807 2.4 2.4 6.69807 2.4 12Z" fill={color}/>
    <circle cx="12" cy="12" r="7" fill={color}/>
  </svg>
)

const getCurrencySymbol = (moneda?: string): string => {
  if (!moneda) return '$'
  const normalized = moneda.trim().toUpperCase()
  const symbols: Record<string, string> = {
    MXN: '$',
    USD: '$',
    EUR: '€',
    GBP: '£',
  }
  return symbols[normalized] || (normalized.length === 1 ? normalized : '$')
}

const formatTotal = (total?: string | number | null, moneda?: string): string => {
  if (total === null || total === undefined) return '$0.00'
  const totalText = typeof total === 'string' ? total : String(total)
  const numeric = totalText.replace(/[^0-9.,-]/g, '').replace(/,/g, '')
  const parsed = Number.parseFloat(numeric)
  const amount = Number.isFinite(parsed) ? parsed.toFixed(2) : numeric
  return `${getCurrencySymbol(moneda)}${amount}`
}

const formatCurrency = (moneda?: string): string => {
  if (!moneda) return 'MXN'
  const currencyMap: Record<string, string> = {
    MX: 'MXN',
    US: 'USD',
  }
  return currencyMap[moneda] || moneda
}

const formatDateTime = ({
  fecha,
  hora,
  fechafull,
}: {
  fecha?: string
  hora?: string
  fechafull?: number
}): string => {
  if (typeof fechafull === 'number' && Number.isFinite(fechafull) && fechafull !== 0) {
    const date = new Date(Math.abs(fechafull) * 1000)
    return `${format(date, 'dd/MM/yyyy HH:mm')}hrs`
  }

  if (!fecha || !hora) return '--'
  const [year, month, day] = fecha.split('-')
  const [hours, minutes] = hora.split(':')
  return `${day}/${month}/${year} ${hours}:${minutes}hrs`
}

const formatHistorialDateTime = (timestamp: number): string => {
  const date = new Date(Math.abs(timestamp) * 1000)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const ampm = date.getHours() >= 12 ? 'P.M.' : 'A.M.'
  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`
}

const copyTextToClipboard = async (text: string): Promise<boolean> => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fall back to legacy clipboard copy.
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', 'true')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '0'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  try {
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  } catch {
    document.body.removeChild(textarea)
    return false
  }
}



const getStatusConfig = (estatus: number, horapagado?: string) => {
  const isPaid = Boolean(horapagado && horapagado.trim() !== '')
  if (isPaid || estatus === 2) {
    return {
      text: 'Pagado',
      icon: <CheckCircleIcon size={10} weight="bold" color="#2CA824" />,
    }
  }

  return {
    text: 'Sin pagar',
    icon: <ClockIcon size={10} weight="bold" color="#BEA51A" />,
  }
}

const getTicketTypeLabel = (tipoticket?: number): string => {
  if (!tipoticket) return 'No definido'
  if (tipoticket === 1) return 'Restaurante'
  if (tipoticket === 2) return 'Check-in'
  return `Tipo ${tipoticket}`
}

export const GenericTicketDetails: React.FC<GenericTicketDetailsProps> = ({
  ticketDetails,
  isLoading = false,
  loadError = false,
}) => {
  const [isHistorialExpanded, setIsHistorialExpanded] = useState(true)
  const [selectedTipPercentage, setSelectedTipPercentage] = useState<number | null>(null)
  const [isProcessingPayment] = useState(false)
  const [paymentCompleted] = useState(false)
  const [paymentStatus] = useState<boolean | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadCompleted, setDownloadCompleted] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState<boolean | null>(null)

  const { RiveComponent } = useRive({
    src: '/animations/loader-pagos-v3.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
  })

  const metadata = ticketDetails.metadata
  const statusValue = ticketDetails.status ?? ticketDetails.estatus ?? 1
  const statusConfig = getStatusConfig(statusValue, metadata?.horapagado)
  const formattedDateTime = formatDateTime({
    fecha: ticketDetails.fecha,
    hora: ticketDetails.hora,
    fechafull: ticketDetails.fechafull,
  })
  const formattedTotal = formatTotal(metadata?.total, metadata?.moneda)
  const formattedCurrency = formatCurrency(metadata?.moneda)
  const qrUrl = ticketDetails.metadata?.url

  const sections = useMemo(() => {
    if (!ticketDetails.secciones) return []
    return Object.values(ticketDetails.secciones).map((section) => ({
      ...section,
      items: section.items ? Object.values(section.items) : [],
    }))
  }, [ticketDetails.secciones])

  const historialEntries = useMemo(() => {
    if (!ticketDetails.historial) return []
    return Object.entries(ticketDetails.historial)
      .map(([id, item]) => ({
        id,
        estatus: item.estatus,
        fecha: item.fecha,
      }))
      .sort((a, b) => Math.abs(b.fecha) - Math.abs(a.fecha))
  }, [ticketDetails.historial])

  const hasHistorial = historialEntries.length > 0

  const totalAmount = (() => {
    const total = metadata?.total
    if (total === null || total === undefined) return 0
    const totalText = typeof total === 'string' ? total : String(total)
    const numeric = totalText.replace(/[^0-9.,-]/g, '').replace(/,/g, '')
    const parsed = Number.parseFloat(numeric)
    return Number.isFinite(parsed) ? parsed : 0
  })()

  const tipAmount = selectedTipPercentage !== null ? (totalAmount * selectedTipPercentage) / 100 : 0
  const totalWithTip = totalAmount + tipAmount
  const formattedTotalWithTip = `${getCurrencySymbol(metadata?.moneda)}${totalWithTip.toFixed(2)}`

  const showPaymentSection = ticketDetails.pago === true

  const handleShare = async () => {
    if (!qrUrl) return

    try {
      if (navigator.share) {
        await navigator.share({ url: qrUrl })
        return
      }
    } catch {
      // Fall back to copying the URL if share is cancelled or fails.
    }

    await copyTextToClipboard(qrUrl)
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    setDownloadCompleted(false)
    setDownloadSuccess(null)
    
    try {
      const ticketId = metadata?.ticketid ?? ticketDetails.spaceid
      
      if (!ticketId) {
        console.error('No ticket ID available for download')
        setDownloadSuccess(false)
        setDownloadCompleted(true)
        setTimeout(() => {
          setIsDownloading(false)
          setDownloadCompleted(false)
        }, 2000)
        return
      }

      const result = await downloadTicket(String(ticketId))
      
      if (result.success && result.data && result.data.mensaje) {
        // Decode base64 PDF
        const base64Data = result.data.mensaje
        const binaryString = atob(base64Data)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        
        // Create blob and download
        const blob = new Blob([bytes], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `ticket-${metadata?.folio ?? ticketId}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        // Show success state
        setDownloadSuccess(true)
        setDownloadCompleted(true)
        
        // Auto-hide after 2 seconds
        setTimeout(() => {
          setIsDownloading(false)
          setDownloadCompleted(false)
          setDownloadSuccess(null)
        }, 2000)
      } else {
        console.error('Download failed:', result.error)
        setDownloadSuccess(false)
        setDownloadCompleted(true)
        
        // Auto-hide after 2 seconds
        setTimeout(() => {
          setIsDownloading(false)
          setDownloadCompleted(false)
          setDownloadSuccess(null)
        }, 2000)
      }
    } catch (error) {
      console.error('Error downloading ticket:', error)
      setDownloadSuccess(false)
      setDownloadCompleted(true)
      
      // Auto-hide after 2 seconds
      setTimeout(() => {
        setIsDownloading(false)
        setDownloadCompleted(false)
        setDownloadSuccess(null)
      }, 2000)
    }
  }

  return (
    <section className="relative mx-[9px] mb-[6px] p-[10px] rounded-[17px] bg-white">
      {isProcessingPayment && (
        <div className="absolute inset-0 z-20 flex justify-center items-center bg-black/70 backdrop-blur-md rounded-[17px]">
          <div className="flex flex-col justify-center items-center gap-y-[12px] w-[154px] h-[157px] mb-[2px] p-[10px] rounded-[10px] bg-white/70">
            <RiveComponent />
            <AnimatePresence mode="wait">
              <motion.h2
                key={paymentCompleted ? 'result-title' : 'loading-title'}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="text-[17px] font-semibold text-black leading-[22px] tracking-[-0.408px]"
              >
                {paymentCompleted
                  ? paymentStatus === true
                    ? 'Pago exitoso'
                    : 'Pago rechazado'
                  : 'Procesando...'}
              </motion.h2>
            </AnimatePresence>
          </div>
        </div>
      )}


      <div className="flex flex-col items-center gap-[7px]">
        <div className="flex flex-col gap-[16px] w-full max-w-[393px] rounded-[10px] px-[9px] py-[9px] bg-[#F7F7F7]">
          <div className="flex items-center gap-[8px]">
            <div className="flex items-center justify-center w-[30px] h-[30px] rounded-[9px] border border-[#F2F2F2] bg-white">
              <TicketDetailsIcon />
            </div>
            <span className="font-inter-regular text-[16px] text-black">Ticket</span>
          </div>

          <div className="flex flex-col gap-[8px]">
            <span className="font-inter-tight font-inter-semibold text-[16px] leading-[100%] text-[#2B333B]">
              {metadata?.nombreplace ?? 'Ticket'}
            </span>
            <div className="flex flex-col items-center px-[10px] py-[8px] gap-[24px] rounded-[10px] bg-[#FCFCFC]">
              <div className="flex flex-col items-start w-full">
                <span className="font-inter-semibold text-[11px] leading-[13px] tracking-[0.06em] uppercase text-[#ADB5BD]">
                  Folio
                </span>
                <span className="font-inter-regular text-[18px] leading-[22px] text-[#495057]">
                  {metadata?.folio ?? ticketDetails.folio}
                </span>
              </div>

              <div className="flex flex-row items-start gap-[8px] w-full">
                <div className="flex flex-col items-start flex-1">
                  <span className="font-inter-semibold text-[11px] leading-[13px] tracking-[0.06em] uppercase text-[#ADB5BD]">
                    Tipo
                  </span>
                  <span className="font-inter-regular text-[13px] leading-[16px] text-[#495057]">
                    {getTicketTypeLabel(metadata?.tipoticket ?? ticketDetails.tipoticket)}
                  </span>
                </div>
              </div>

              <div className="flex flex-row items-start gap-[8px] w-full">
                <div className="flex flex-col items-start flex-1">
                  <span className="font-inter-semibold text-[11px] leading-[13px] tracking-[0.06em] uppercase text-[#ADB5BD]">
                    Fecha
                  </span>
                  <span className="font-inter-regular text-[13px] leading-[16px] text-[#495057]">
                    {formattedDateTime}
                  </span>
                </div>
                <div className="flex flex-col items-start flex-1">
                  <span className="font-inter-semibold text-[11px] leading-[13px] tracking-[0.06em] uppercase text-[#ADB5BD]">
                    Estatus
                  </span>
                  <div className="flex flex-row items-center gap-[4px]">
                    {statusConfig.icon}
                    <span className="font-inter-regular text-[13px] leading-[16px] text-[#495057]">
                      {statusConfig.text}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start w-full">
                <span className="font-inter-semibold text-[11px] leading-[13px] tracking-[0.06em] uppercase text-[#ADB5BD]">
                  Total
                </span>
                <div className="flex flex-row items-center gap-[4px]">
                  <span className="font-inter-semibold text-[18px] leading-[22px] text-[#2B333B]">
                    {formattedTotal}
                  </span>
                  <span className="font-inter-medium text-[11px] leading-[13px] tracking-[0.06em] text-[#ADB5BD]">
                    {formattedCurrency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {sections.length > 0 && (
            <div className="flex flex-col items-end gap-[8px] w-full rounded-[10px] px-[10px] py-[8px] bg-[#FCFCFC]">
              {sections.map((section, index) => (
                <div key={`${section.titulo ?? 'seccion'}-${index}`} className="w-full">
                  <div className="flex flex-col gap-[4px]">
                    <span className="font-inter-semibold text-[11px] leading-[13px] tracking-[0.12em] uppercase text-[#ADB5BD]">
                      {section.titulo ?? 'Productos'} ({section.items?.length ?? 0})
                    </span>
                    <div className="flex flex-col gap-[4px]">
                      {section.items?.map((item, itemIndex) => (
                        <div
                          key={`${item.nombre ?? 'item'}-${itemIndex}`}
                          className="flex items-start gap-[8px]"
                        >
                          <span className="flex-1 font-inter-regular text-[13px] leading-[16px] text-[#495057]">
                            {item.nombre}
                          </span>
                          <span className="font-inter-regular text-[13px] leading-[16px] text-[#495057] text-right">
                            {item.valor}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full border-t border-[#E9ECEF] my-[8px]" />
                  <div className="flex items-center gap-[8px] w-full">
                    <span className="flex-1 font-inter-semibold text-[13px] leading-[16px] text-[#2B333B]">
                      Total
                    </span>
                    <span className="font-inter-semibold text-[13px] leading-[16px] text-[#2B333B]">
                      {formattedTotal}
                    </span>
                    <span className="font-inter-medium text-[11px] leading-[13px] text-[#ADB5BD]">
                      {formattedCurrency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col items-start gap-[8px] w-full">
            <div className="flex flex-row items-start gap-[8px] w-full">
              <button
                type="button"
                onClick={handleShare}
                className="flex justify-center items-center p-[11px_16px] gap-[6px] w-[46px] h-[36px] bg-[#F0F2F4] rounded-[18px] hover:bg-[#E5E7EA] transition-colors"
              >
                <ExportIcon size={14} color="#6C757D" />
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className={`flex flex-row justify-center items-center p-[11px_0px] gap-[6px] flex-1 h-[36px] rounded-[18px] transition-all duration-300 overflow-hidden relative ${
                  downloadCompleted && downloadSuccess
                    ? 'bg-[#2CA824] hover:bg-[#2CA824]'
                    : downloadCompleted && !downloadSuccess
                    ? 'bg-[#DC3545] hover:bg-[#DC3545]'
                    : isDownloading
                    ? 'bg-[#027AFF] cursor-not-allowed'
                    : 'bg-[#F0F2F4] hover:bg-[#E5E7EA]'
                }`}
              >
                <AnimatePresence mode="wait">
                  {!isDownloading && !downloadCompleted && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-[6px]"
                    >
                      <DownloadSimpleIcon size={14} color="#ADB5BD" />
                      <span className="font-inter-medium text-[14px] leading-[100%] text-center tracking-[-0.01em] text-[#495057]">
                        Descargar ticket
                      </span>
                    </motion.div>
                  )}
                  
                  {isDownloading && !downloadCompleted && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-[6px]"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: 'linear',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="#FFFFFF"
                            strokeWidth="3"
                            strokeOpacity="0.25"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="#FFFFFF"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray="40 60"
                          />
                        </svg>
                      </motion.div>
                      <span className="font-inter-medium text-[14px] leading-[100%] text-center tracking-[-0.01em] text-white">
                        Descargando...
                      </span>
                    </motion.div>
                  )}
                  
                  {downloadCompleted && downloadSuccess && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="flex items-center gap-[6px]"
                    >
                      <motion.svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      >
                        <motion.path
                          d="M5 12L10 17L19 8"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        />
                      </motion.svg>
                      <span className="font-inter-medium text-[14px] leading-[100%] text-center tracking-[-0.01em] text-white">
                        Descargado
                      </span>
                    </motion.div>
                  )}
                  
                  {downloadCompleted && !downloadSuccess && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                      className="flex items-center gap-[6px]"
                    >
                      <motion.svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
                      >
                        <motion.path
                          d="M6 6L18 18M18 6L6 18"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        />
                      </motion.svg>
                      <span className="font-inter-medium text-[14px] leading-[100%] text-center tracking-[-0.01em] text-white">
                        Error
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {showPaymentSection && (
          <div className="flex flex-col items-center gap-[16px] w-full max-w-[393px] rounded-[10px] px-[9px] py-[9px] bg-[#F7F7F7]">
            <div className="flex items-center gap-[6px] w-full">
              <div className="flex items-center justify-center w-[30px] h-[30px] rounded-[9px] bg-white">
                <MoneyBillIcon />
              </div>
              <span className="font-inter-regular text-[16px] text-black">
                Selecciona el método de pago
              </span>
            </div>

            <div className="flex items-center gap-[8px] w-full">
              <button
                type="button"
                className="flex flex-col justify-center items-center w-full h-[48px] bg-white border border-[#007AFF] rounded-[14px]"
              >
                <div className="flex items-center gap-[9px]">
                  <PhoneIcon />
                  <span className="font-inter-regular text-[13px] text-black">En aplicación</span>
                </div>
              </button>
            </div>

            <div className="flex flex-col items-start gap-[8px] w-full">
              <div className="flex items-center gap-[6px] w-full">
                <div className="flex items-center justify-center w-[30px] h-[30px] rounded-[9px] bg-white">
                  <CurrencyDollarIcon size={16} color="#6C757D" />
                </div>
                <span className="font-inter-regular text-[16px] text-black">Propina</span>
              </div>

              <div className="flex items-start gap-[8px] w-full">
                {[0, 5, 10, 15].map((percentage) => {
                  const tipValue = (totalAmount * percentage) / 100
                  const isSelected = selectedTipPercentage === percentage
                  return (
                    <button
                      key={percentage}
                      type="button"
                      onClick={() => setSelectedTipPercentage(percentage)}
                      className={`flex flex-col justify-center items-center py-[10px] px-[8px] gap-[2px] flex-1 h-[54px] rounded-[14px] border transition-all duration-300 ease-out overflow-hidden ${
                        isSelected
                          ? 'bg-[rgba(2,122,255,0.05)] border-[#027AFF] scale-[1.02]'
                          : 'bg-white border-[#E9ECEF] hover:border-[#027AFF] hover:bg-[rgba(2,122,255,0.02)] active:scale-[0.98]'
                      }`}
                    >
                      <span
                        className={`font-inter-semibold text-[16px] leading-[19px] transition-colors duration-300 ease-out ${
                          isSelected ? 'text-[#027AFF]' : 'text-[#495057]'
                        }`}
                      >
                        {percentage}%
                      </span>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={`${percentage}-${tipValue.toFixed(2)}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="font-inter-regular text-[12px] leading-[15px] text-[#6C757D]"
                        >
                          ${tipValue.toFixed(2)}
                        </motion.span>
                      </AnimatePresence>
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              type="button"
              disabled={selectedTipPercentage === null || isProcessingPayment}
              className={`flex items-center justify-center gap-[6px] w-full h-[44px] rounded-[22px] bg-[#027AFF] transition-all duration-300 ease-out overflow-hidden ${
                selectedTipPercentage !== null && !isProcessingPayment
                  ? 'opacity-100 cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <CheckCircleIcon size={16} weight="fill" color="#F8F9FA" />
              <span className="font-inter-tight font-semibold text-[14px] leading-[100%] text-center text-[#F8F9FA]">
                Pagar
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={formattedTotalWithTip}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="font-inter-tight font-semibold text-[14px] leading-[100%] text-center text-[#F8F9FA]"
                >
                  {formattedTotalWithTip} {formattedCurrency}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex w-full max-w-[393px] justify-center py-[8px]">
            <span className="font-inter-regular text-[13px] text-[#6C757D]">
              Cargando detalles del ticket...
            </span>
          </div>
        )}

        {loadError && (
          <div className="flex w-full max-w-[393px] justify-center py-[8px]">
            <span className="font-inter-regular text-[13px] text-[#A82424]">
              No se pudo cargar la informacion del ticket.
            </span>
          </div>
        )}

        <div className="flex flex-col items-start gap-[8px] w-full max-w-[393px] rounded-[10px] px-[9px] py-[9px] bg-[#F7F7F7]">
          <div className="flex items-center gap-[6px]">
            <div className="flex items-center justify-center w-[30px] h-[30px] rounded-[9px] bg-white">
              <QrCodeIcon size={16} />
            </div>
            <span className="font-inter-regular text-[16px] text-black">QR</span>
          </div>
          <div className="flex flex-col gap-[8px] w-full">
            <div className="flex items-center gap-[8px] w-full rounded-[10px] px-[8px] py-[10px] border border-[#B4B4B4] bg-white">
              <div className="shrink-0">
                <HelpIcon />
              </div>
              <span className="font-inter-regular text-[12px] leading-[15px] text-black">
                Escanea este codigo QR para acceder de forma rapida y segura a tu ticket digital,
                donde podras consultar todos los detalles de tu acceso.
              </span>
            </div>
            <div className="flex flex-col items-center gap-[8px] w-full">
              <div className="box-border flex flex-row justify-center items-center p-[8px] gap-[8px] w-[136px] h-[136px] bg-[#F8F9FA] border border-white rounded-[12px] mx-auto overflow-hidden">
                {qrUrl ? (
                  <div className="w-[120px] h-[120px] rounded-[2px] overflow-hidden">
                    <QRCode value={qrUrl} size={120} style={{ width: 120, height: 120 }} />
                  </div>
                ) : (
                  <span className="font-inter-regular text-[12px] text-[#6C757D]">
                    No hay QR disponible
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {hasHistorial && (
          <div className="flex flex-col items-start w-full max-w-[393px] bg-[#F8F9FA] rounded-[18px] overflow-hidden">
            <button
              type="button"
              onClick={() => setIsHistorialExpanded(!isHistorialExpanded)}
              className="flex flex-row justify-between items-center w-full h-[44px] px-[16px] hover:bg-[#F0F2F4] transition-colors duration-200"
            >
              <span className="flex items-center gap-[6px] font-inter-medium text-[14px] text-[#6C757D]">
                <CalendarIcon size={16} color="#6C757D" />
                Historial del boleto
              </span>
              <div
                className="transition-transform duration-300 ease-in-out"
                style={{ transform: isHistorialExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <CaretDownIcon size={12} color="#6C757D" />
              </div>
            </button>

            <div
              className="grid transition-all duration-300 ease-out overflow-hidden"
              style={{
                gridTemplateRows: isHistorialExpanded ? '1fr' : '0fr',
              }}
            >
              <div className="min-h-0">
                <div className="flex flex-col items-start px-[16px] pb-[14px] gap-[16px] w-full">
                  <div className="relative flex flex-col gap-[8px] w-full">
                    {historialEntries.length > 1 && (
                      <div
                        className="absolute left-[12px] top-[12px] w-px bg-[#DCDCDC] z-0"
                        style={{ height: `calc(100% - 24px)` }}
                      />
                    )}

                    {historialEntries.map((entry, index) => {
                      const isNewest = index === 0
                      const pointColor = isNewest ? '#218877' : '#027AFF'
                      const textColor = isNewest ? '#218877' : '#495057'

                      return (
                        <div
                          key={entry.id}
                          className="flex flex-row items-center gap-[8px] w-full min-h-[30px] relative z-10"
                        >
                          <div className="shrink-0">
                            <TimelineDotIcon color={pointColor} />
                          </div>

                          <div className="flex flex-col items-start gap-[2px] flex-1">
                            <span className="font-inter-semibold text-[11px] leading-[13px] tracking-[0.06em] uppercase text-[#ADB5BD]">
                              {formatHistorialDateTime(entry.fecha)}
                            </span>
                            <span
                              className="font-inter-medium text-[14px] leading-[17px]"
                              style={{
                                color: textColor,
                                fontWeight: isNewest ? 500 : 400,
                              }}
                            >
                              {entry.estatus}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          className="flex flex-row justify-between items-center w-full max-w-[393px] h-[42px] px-[16px] rounded-[18px] bg-[#F8F9FA]"
        >
          <span className="flex items-center gap-[6px] font-inter-medium text-[14px] text-[#6C757D]">
            <HeadsetIcon size={12} color="#6C757D" />
            ¿Necesitas ayuda?
          </span>
          <CaretDownIcon size={12} color="#6C757D" />
        </button>
      </div>
    </section>
  )
}
