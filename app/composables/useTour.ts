// app/composables/useTour.ts
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useRouter } from 'vue-router'

// Persists across sessions (same pattern as auth_token) so the tour only
// ever auto-fires once per account, not once per browser tab/localStorage.
const hasSeenTour = () => useCookie<boolean>('klea_has_seen_tour', {
  default: () => false,
  maxAge: 60 * 60 * 24 * 365,
})

export function useTour() {
  const router = useRouter()

  const isOnDashboard = () => /^\/[^/]+\/dashboard\/?$/.test(router.currentRoute.value.path)

  const startTour = () => {
    if (!isOnDashboard()) {
      const workspaceSlug = router.currentRoute.value.params.workspaceSlug
      const target = workspaceSlug ? `/${workspaceSlug}/dashboard` : '/dashboard'
      router.push(target).then(() => setTimeout(initTour, 500))
    } else {
      initTour()
    }
  }

  /** Auto-starts the tour once, ever, the first time a user reaches the dashboard. Safe to call on every dashboard mount. */
  const startTourIfFirstVisit = () => {
    const seen = hasSeenTour()
    if (seen.value) return
    seen.value = true
    setTimeout(initTour, 500)
  }

  const initTour = () => {
    const tour = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(0, 0, 0, 0.75)',
      popoverClass: 'klea-tour-theme', // We will style this in CSS
      steps: [
        {
          element: '.font-heading.text-3xl', // Welcome text
          popover: {
            title: 'Welcome to Klea!',
            description: 'This quick tour will show you around the dashboard so you can start issuing licenses.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-workspace',
          popover: {
            title: 'Your Workspace',
            description: 'Manage your organization, billing, and team members from here.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-app-switcher',
          popover: {
            title: 'App Switcher',
            description: 'Quickly switch between your different software products and applications.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-env-toggle',
          popover: {
            title: 'Environment Toggle',
            description: 'Switch between Test mode (sandbox) and Live mode (production). Make sure you use the right API keys!',
            side: 'bottom',
            align: 'end'
          }
        },
        {
          element: '#tour-create-app',
          popover: {
            title: 'Create your App',
            description: 'Click here to register a new application and start issuing licenses for it.',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: '#tour-first-app-card',
          popover: {
            title: 'Open your App',
            description: 'Click on your app to open its dashboard. Inside, you\'ll find its specific settings like Plans, Features, and API Keys.',
            side: 'top',
            align: 'center'
          }
        }
      ]
    })
    
    tour.drive()
  }

  return { startTour, startTourIfFirstVisit }
}
