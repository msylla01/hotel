import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'
import Chatbot from '../components/chatbot/Chatbot'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Chatbot />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
            },
          },
        }}
      />
    </>
  )
}
