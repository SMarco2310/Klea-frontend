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

// Set right before navigating into a newly-created app (CreateAppModal),
// only while the dashboard tour is actually running. sessionStorage (not a
// ref) because it has to survive the hard page navigation into the app's
// own route — a Vue-level flag would be torn down with the old page.
const APP_TOUR_FLAG = 'klea_continue_tour_in_app'

// True while the dashboard tour is on its "create your first app" step —
// set/cleared by the tour itself, read by CreateAppModal to know whether
// this particular app creation should hand off to the app-section tour.
const isAwaitingAppCreation = ref(false)

export function useTour() {
  const router = useRouter()

  const isOnDashboard = () => /^\/[^/]+\/dashboard\/?$/.test(router.currentRoute.value.path)

  const startTour = () => {
    if (!isOnDashboard()) {
      const workspaceSlug = router.currentRoute.value.params.workspaceSlug
      const target = workspaceSlug ? `/${workspaceSlug}/dashboard` : '/dashboard'
      router.push(target).then(() => setTimeout(initDashboardTour, 500))
    } else {
      initDashboardTour()
    }
  }

  /** Auto-starts the tour once, ever, the first time a user reaches the dashboard. Safe to call on every dashboard mount. */
  const startTourIfFirstVisit = () => {
    const seen = hasSeenTour()
    if (seen.value) return
    seen.value = true
    setTimeout(initDashboardTour, 500)
  }

  /** Call from CreateAppModal right before navigating into the new app. Only hands off to the app tour if the dashboard tour led the user here. */
  function markCreateAppStepDone() {
    if (isAwaitingAppCreation.value) {
      sessionStorage.setItem(APP_TOUR_FLAG, '1')
      isAwaitingAppCreation.value = false
    }
  }

  /** Call once on mount of an app's own page (e.g. analytics.vue) — resumes the tour there if the flag was set, no-ops otherwise. */
  function continueTourInAppIfFlagged() {
    if (sessionStorage.getItem(APP_TOUR_FLAG) !== '1') return
    sessionStorage.removeItem(APP_TOUR_FLAG)
    setTimeout(initAppTour, 500)
  }

  const initDashboardTour = () => {
    const tour = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(0, 0, 0, 0.75)',
      popoverClass: 'klea-tour-theme',
      // Covers: user reaches the create-app step, then closes the tour
      // (X / Escape) without creating one. Without this, a later,
      // unrelated app creation would incorrectly hand off to the app tour.
      onDestroyed: () => {
        isAwaitingAppCreation.value = false
      },
      steps: [
        {
          element: '.font-heading.text-3xl',
          popover: {
            title: 'Welcome to Klea!',
            description: 'This quick tour will show you around the dashboard, then walk you through creating your first app.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-workspace',
          popover: {
            title: 'Your Workspace',
            description: 'Manage your organization, billing, and team members from here.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-app-switcher',
          popover: {
            title: 'App Switcher',
            description: 'Quickly switch between your different software products and applications.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-env-toggle',
          popover: {
            title: 'Environment Toggle',
            description: 'Switch between Test mode (sandbox) and Live mode (production). Make sure you use the right API keys!',
            side: 'bottom',
            align: 'end',
          },
        },
        {
          element: '#tour-create-app',
          popover: {
            title: "Let's create your first app",
            description: "Click this button (it still works while highlighted) to open the form, give it a name, and hit “Create app” — we'll pick the tour back up once it's ready. Or click Next to skip ahead.",
            side: 'left',
            align: 'start',
          },
          onHighlightStarted: () => {
            isAwaitingAppCreation.value = true
          },
        },
      ],
    })

    tour.drive()
  }

  const initAppTour = () => {
    const tour = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(0, 0, 0, 0.75)',
      popoverClass: 'klea-tour-theme',
      steps: [
        {
          popover: {
            title: 'App created!',
            description: "This is your app's home — here's where everything for it lives.",
          },
        },
        {
          element: '#tour-sidebar-plans-access',
          popover: {
            title: 'Plans & access',
            description: 'Define pricing plans your subscribers can buy — price, duration, and which features each plan unlocks.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '#tour-sidebar-features',
          popover: {
            title: 'Features',
            description: 'The building blocks your plans grant access to — create these first, then attach them to plans.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '#tour-sidebar-api-keys',
          popover: {
            title: 'API Keys',
            description: 'Generate a key here to authenticate requests from your own app — test and live keys are separate.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '#tour-sidebar-webhooks',
          popover: {
            title: 'Webhooks',
            description: "Get notified the moment a subscriber's payment succeeds or fails.",
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '#tour-sidebar-settings',
          popover: {
            title: 'Settings',
            description: "Rename the app, set its webhook URL, or delete it here. That's the tour — you're ready to start issuing licenses.",
            side: 'right',
            align: 'start',
          },
        },
      ],
    })

    tour.drive()
  }

  return { startTour, startTourIfFirstVisit, markCreateAppStepDone, continueTourInAppIfFlagged }
}
