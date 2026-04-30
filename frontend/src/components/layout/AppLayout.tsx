import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'

export function AppLayout() {
  return (
    <div className="flex h-full min-h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
