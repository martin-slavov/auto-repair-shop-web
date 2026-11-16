import { Link } from 'react-router'

function ForbiddenPage() {
  return (
    <>
      <h1>Access denied</h1>
      <p>You do not have access to this page.</p>
      <Link to="/">Back to home</Link>
    </>
  )
}

export default ForbiddenPage
