// app/composables/useTour.ts
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useRouter } from 'vue-router'

export function useTour() {
  const router = useRouter()

  const startTour = () => {
    // If not on dashboard, navigate there first
    if (router.currentRoute.value.path !== '/dashboard') {
      router.push('/dashboard').then(() => setTimeout(initTour, 500))
    } else {
      initTour()
    }
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
          element: '#tour-sidebar-plans-access',
          popover: {
            title: 'Create Plans',
            description: 'Define your pricing tiers and what features each plan unlocks.',
            side: 'right',
            align: 'center'
          }
        },
        {
          element: '#tour-sidebar-features',
          popover: {
            title: 'Define Features',
            description: 'Create features that are granted when users subscribe to your plans.',
            side: 'right',
            align: 'center'
          }
        },
        {
          element: '#tour-sidebar-api-keys',
          popover: {
            title: 'Generate API Keys',
            description: 'Get your API keys here to integrate Klea with your checkout flow or backend.',
            side: 'right',
            align: 'center'
          }
        },
        {
          element: '#tour-sidebar-analytics',
          popover: {
            title: 'Track Performance',
            description: 'Monitor your revenue, active subscribers, and conversion rates in real time.',
            side: 'right',
            align: 'center'
          }
        }
      ]
    })
    
    tour.drive()
  }

  return { startTour }
}
