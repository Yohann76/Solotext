/**
 * Central registry of backend endpoints (path only; client adds base).
 * Keep segments clear and composable.
 */
export const endpoints = {
  // Public/auth if needed later
  // auth: { login: '/auth/login', register: '/auth/register' },

  analyses: {
    root: '/analyses',
    byId: (id) => `/analyses/${id}`,
    sentences: (id) => `/analyses/${id}/sentences`
  },

  admin: {
    root: '/admin',
    users: {
      root: '/admin/users',
      byId: (id) => `/admin/users/${id}`
    },
    analyses: {
      root: '/admin/analyses',
      byId: (id) => `/admin/analyses/${id}`
    },
    stats: '/admin/stats',
    providers: {
      root: '/admin/providers',
      byId: (id) => `/admin/providers/${id}`
    },
    costs: {
      userCosts: '/admin/costs/users'
    }
  }
}


