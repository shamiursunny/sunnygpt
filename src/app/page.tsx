'use client'

import { useState } from 'react'
import { ChatInterface } from '@/components/chat-interface'
import { Sidebar } from '@/components/sidebar'
import { Footer } from '@/components/footer'

export default function Home() {
  const [currentChatId, setCurrentChatId] = useState<string | undefined>()

  const handleNewChat = () => {
    setCurrentChatId(undefined)
  }

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId)
  }

  const handleChatCreated = (chatId: string) => {
    setCurrentChatId(chatId)
  }

  const handleChatDeleted = () => {
    // Reset to new chat when current chat is deleted
    setCurrentChatId(undefined)
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentChatId={currentChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          onChatDeleted={handleChatDeleted}
        />
        <main className="flex-1 flex flex-col">
          <header className="border-b p-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              SunnyGPT
            </h1>
          </header>
          <ChatInterface
            chatId={currentChatId}
            onChatCreated={handleChatCreated}
          />
        </main>
      </div>
      <Footer />
    </div>
  )
}
