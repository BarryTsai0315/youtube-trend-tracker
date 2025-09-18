import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ size = 'default', text = '載入中...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary mb-2`} />
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  )
}

export default LoadingSpinner

