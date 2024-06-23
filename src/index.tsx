// index.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './Styles/index.scss'

const rootElement = document.getElementById('root') as HTMLBaseElement

ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)
