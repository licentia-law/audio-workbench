import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { CutPage } from '../pages/CutPage'
import { AnalyzePage } from '../pages/AnalyzePage'
import { KeyShiftPage } from '../pages/KeyShiftPage'
import { AmplifyPage } from '../pages/AmplifyPage'
import { StemMixPage } from '../pages/StemMixPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <CutPage /> },
      { path: 'cut', element: <CutPage /> },
      { path: 'analyze', element: <AnalyzePage /> },
      { path: 'keyshift', element: <KeyShiftPage /> },
      { path: 'amplify', element: <AmplifyPage /> },
      { path: 'stemmix', element: <StemMixPage /> },
    ],
  },
])
