import { Link } from 'react-router'
import { buttonVariants } from '@/components/ui/button'

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1>Page not found</h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <Link to="/" className={buttonVariants()}>
        Back to home
      </Link>
    </div>
  )
}

export default NotFoundPage
