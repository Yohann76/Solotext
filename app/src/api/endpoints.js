/**
 * Central registry of backend endpoints (path only; client adds base).
 * Keep segments clear and composable.
 */
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    changePassword: '/auth/change-password'
  },

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
    },
    newsletter: {
      root: '/admin/newsletter',
      stats: '/admin/newsletter/stats',
      export: '/admin/newsletter/export'
    }
  },

  credits: {
    root: '/credits'
  },

  user: {
    profile: '/user/profile',
    updateProfile: '/user/profile',
    subscriptions: '/user/subscriptions',
    cancelSubscription: '/user/subscriptions/cancel'
  },

  stripe: {
    subscription: '/stripe/subscription',
    createCheckoutSession: '/stripe/create-checkout-session'
  },

  newsletter: {
    subscribe: '/newsletter/subscribe'
  }
}


