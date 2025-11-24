/**
 * Home Page Component
 * 
 * Main page of the SunnyGPT application. Manages the overall layout including:
 * - Sidebar for chat history
 * - Main chat interface
 * - Footer with attribution
 * 
 * Handles state management for current chat selection and chat lifecycle events.
 * 
 * @author Shamiur Rashid Sunny
 * @website https://shamiur.com
 * @copyright © 2025 Shamiur Rashid Sunny - All Rights Reserved
 * @license Proprietary - Usage requires explicit permission from the author
 */

'use client'

import { useState } from 'react'
import { ChatInterface } from '@/components/chat-interface'
import { Sidebar } from '@/components/sidebar'
import { Footer } from '@/components/footer'

export default function Home() {
  // State to track the currently active chat ID
  const [currentChatId, setCurrentChatId] = useState<string | undefined>()

  // Handler for creating a new chat (resets current chat ID)
  const handleNewChat = () => {
    setCurrentChatId(undefined)
  }

  // Handler for selecting an existing chat from the sidebar
  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId)
  }

  // Handler for when a new chat is created (sets it as current)
  const handleChatCreated = (chatId: string) => {
    setCurrentChatId(chatId)
  }

  // Handler for when the current chat is deleted (resets to new chat)
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
