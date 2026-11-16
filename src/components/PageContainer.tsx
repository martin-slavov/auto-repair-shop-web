import { Outlet } from 'react-router'

function PageContainer() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <Outlet />
    </div>
  )
}

export default PageContainer
