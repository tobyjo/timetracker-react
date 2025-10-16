import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-isdsnzl58pgmx3kw.us.auth0.com"
      clientId="5GAiTgREXXzepDRVk7QfRXr4ffPZ5r25"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "timetracker", // Your API identifier
        scope: "openid profile email read:timeentries write:timeentries read:projects write:projects read:segments write:segments"
      }}
    >
    <App />
    </Auth0Provider>
  </StrictMode>,
)
