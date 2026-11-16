import { Link } from 'react-router'
import { buttonVariants } from '@/components/ui/button'

function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1>Access denied</h1>
      <p className="text-muted-foreground">You do not have access to this page.</p>
      <Link to="/" className={buttonVariants()}>
        Back to home
      </Link>
    </div>
  )
}

export default ForbiddenPage
