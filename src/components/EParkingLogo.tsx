interface EParkingLogoProps {
  className?: string
  size?: 'small' | 'medium' | 'large'
}

export function EParkingLogo({ className = '', size = 'medium' }: EParkingLogoProps) {
  const containerSizes = {
    small: 'w-10 h-7',
    medium: 'w-[57px] h-[38px]',
    large: 'w-16 h-12',
  }

  const imageSizes = {
    small: 'w-6 h-6',
    medium: 'w-[38px] h-[38px]',
    large: 'w-10 h-10',
  }

  return (
    <div
      className={`
        ${containerSizes[size]}
        bg-white
        flex items-center justify-center
        ${className}
      `}
      style={{
        borderRadius: '50%',
      }}
    >
      <img
        src="https://blikon.blob.core.windows.net/spaces/epaking.png"
        alt="E-Parking Logo"
        className={`${imageSizes[size]} object-contain`}
      />
    </div>
  )
}
