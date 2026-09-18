import type { JSX } from 'react'
import PetView from './pet/PetView'
import ChatView from './chat/ChatView'

function currentView(): 'pet' | 'chat' {
  const hash = window.location.hash.replace(/^#\/?/, '')
  return hash.startsWith('chat') ? 'chat' : 'pet'
}

export default function App(): JSX.Element {
  const view = currentView()
  document.documentElement.dataset.view = view
  document.body.dataset.view = view
  return view === 'chat' ? <ChatView /> : <PetView />
}
