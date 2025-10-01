import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Message de bienvenue
      setTimeout(() => {
        setMessages([{
          id: 1,
          text: "Bonjour ! Je suis l'assistant IA d'Hotel Luxe 🤖 Développé par msylla01. Comment puis-je vous aider ?",
          isBot: true,
          timestamp: new Date(),
          suggestions: [
            { text: "Voir les chambres", action: "rooms" },
            { text: "Comment réserver", action: "booking" },
            { text: "Contact", action: "contact" }
          ]
        }])
      }, 500)
    }
  }, [isOpen])

  const sendMessage = async (text = inputMessage) => {
    if (!text.trim()) return

    const userMessage = {
      id: Date.now(),
      text: text.trim(),
      isBot: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      const response = await fetch('http://localhost:5000/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: text.trim() })
      })

      const data = await response.json()

      setTimeout(() => {
        setIsTyping(false)
        
        if (data.success) {
          const botMessage = {
            id: Date.now() + 1,
            text: data.response,
            isBot: true,
            timestamp: new Date(),
            suggestions: data.suggestedActions
          }
          setMessages(prev => [...prev, botMessage])
        } else {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            text: "Désolé, je rencontre un problème technique. Contactez +33 1 23 45 67 89 📞",
            isBot: true,
            timestamp: new Date()
          }])
        }
      }, 1000)

    } catch (error) {
      console.error('❌ Erreur chatbot frontend [msylla01]:', error)
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Erreur de connexion. Vérifiez votre réseau ou contactez l'équipe ! 📞",
        isBot: true,
        timestamp: new Date()
      }])
    }
  }

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion.text)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Bouton d'ouverture */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 flex items-center justify-center ${isOpen ? 'hidden' : 'block'}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </motion.button>

      {/* Fenêtre de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold">Assistant IA</h3>
                  <p className="text-xs text-blue-100">Hotel Luxe • msylla01</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <XMarkIcon className="w-4 h-4 mx-auto" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.isBot 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-blue-600 text-white'
                    }`}>
                      {message.text}
                    </div>
                  </div>
                  
                  {/* Suggestions */}
                  {message.suggestions && (
                    <div className="flex flex-wrap gap-1">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
                        >
                          {suggestion.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                IA développée par msylla01 • 2025-10-01 15:49:08 UTC
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
