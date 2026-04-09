// Main page - handles the overall app layout
// Built by Shamiur Rashid Sunny (shamiur.com)

'use client'

import { useState } from 'react'
import { ChatInterface } from '@/components/chat-interface'
import { Sidebar } from '@/components/sidebar'
import { Footer } from '@/components/footer'
import { Menu, Plus, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Home() {
  // Track which chat is currently open
  const [currentChatId, setCurrentChatId] = useState<string | undefined>()

  // Mobile sidebar state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Handler for creating a new chat (resets current chat ID)
  const handleNewChat = () => {
    setCurrentChatId(undefined)
  }

  // Handler for selecting an existing chat from the sidebar
  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId)
    // Close sidebar on mobile when a chat is selected
    setIsMobileMenuOpen(false)
  }

  // Handler for when a new chat is created (sets it as current)
  const handleChatCreated = (chatId: string) => {
    setCurrentChatId(chatId)
    setIsMobileMenuOpen(false)
  }

  // Handler for when the current chat is deleted (resets to new chat)
  const handleChatDeleted = () => {
    // Reset to new chat when current chat is deleted
    setCurrentChatId(undefined)
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          currentChatId={currentChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          onChatDeleted={handleChatDeleted}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        <main className="flex-1 flex flex-col w-full">
          <header className="border-b p-4 flex items-center gap-3">
            {currentChatId ? (
              <button
                onClick={handleNewChat}
                className="md:hidden p-2 -ml-2 rounded-md hover:bg-muted transition-colors"
                aria-label="Back to new chat"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-md hover:bg-muted transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex-1">
              SunnyGPT
            </h1>
            {/* Added this button so mobile users can easily start a fresh chat without digging in the menu */}
            <button
              onClick={handleNewChat}
              className="md:hidden p-2 -mr-2 rounded-md hover:bg-muted transition-colors text-primary"
              aria-label="New chat"
            >
              <Plus className="h-5 w-5" />
            </button>
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
