import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
  fallbackAction?: string
}

interface State {
  hasError: boolean
}

/**
 * Simple error boundary that catches render errors and shows a
 * recovery message instead of a white screen.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F6F3] flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <p className="text-lg font-semibold text-[#1a1a1a] mb-2">
              {this.props.fallbackTitle ?? 'Something went wrong'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-mono bg-[#1a1a1a] text-[#F8F6F3] rounded-sm hover:bg-[#333] cursor-pointer"
            >
              {this.props.fallbackAction ?? 'Reload'}
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
