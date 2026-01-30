// Server-side exports
export { createSupabaseServerClient } from './server'

// Client-side exports (re-export for convenience)
export { createSupabaseBrowserClient, getSupabaseBrowserClient } from './client'

// Middleware export
export { updateSession } from './middleware'
