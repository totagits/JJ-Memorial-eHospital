import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Web Speech / Audio / Notifications
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'Notification', {
    value: {
      permission: 'granted',
      requestPermission: vi.fn().mockResolvedValue('granted'),
    },
    writable: true,
  })

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock ResizeObserver as a constructor class for Recharts
  class ResizeObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  ;(globalThis as any).ResizeObserver = ResizeObserverMock;
}
