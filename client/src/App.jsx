import { createBrowserRouter, RouterProvider } from "react-router-dom"
import IndexPage from "./pages/Index"
import TermsPage from "./pages/Terms"
import ErrorPage from "./pages/Error"

const App = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <IndexPage />,
      errorElement: <ErrorPage />
    },
    {
      path: '/terms',
      element: <TermsPage />,
      errorElement: <ErrorPage />
    }
  ])

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  )
}

export default App