export const tourSteps = {
  // Common across all roles if needed, or specific
  client: {
    '/dashboard': [
      {
        target: 'body',
        content: 'Welcome to your EGCN Dashboard! Let\'s take a quick tour to help you get started.',
        placement: 'center',
        disableBeacon: true,
      },
      {
        target: '.tour-health-score',
        content: 'This is your overall Business Health Score. Keep an eye on it—it updates based on your daily inputs.',
        placement: 'bottom',
      },
      {
        target: '.tour-revenue-chart',
        content: 'Track your actual revenue against your targets here. Red is actual, purple is your goal.',
        placement: 'bottom',
      },
      {
        target: '.tour-upcoming-meetings',
        content: 'Any upcoming consultations with your expert will appear right here.',
        placement: 'top',
      },
    ],
    '/dashboard/profile': [
      {
        target: '.tour-profile-details',
        content: 'Here you can update your business name, contact info, and industry type.',
        placement: 'right',
      },
      {
        target: '.tour-subscription-plan',
        content: 'View your current active plan and upgrade whenever you are ready.',
        placement: 'left',
      },
    ],
    '/dashboard/workspace': [
      {
        target: '.tour-file-upload',
        content: 'Upload financial documents, pitch decks, or any files you want your expert to review.',
        placement: 'bottom',
      },
      {
        target: '.tour-video-call',
        content: 'Ready to talk? Click here to start an instant, secure video call with your expert.',
        placement: 'left',
      },
    ],
    '/dashboard/target/daily': [
      {
        target: '.tour-date-picker',
        content: 'Select a date to enter your daily revenue and expenses.',
        placement: 'bottom',
      },
      {
        target: '.tour-input-form',
        content: 'Fill in your numbers honestly. This data feeds directly into your health score.',
        placement: 'right',
      },
    ],
  },
  expert: {
    '/expert-dashboard': [
      {
        target: 'body',
        content: 'Welcome to the Expert Dashboard. Here is where you manage all your assigned clients.',
        placement: 'center',
        disableBeacon: true,
      },
      {
        target: '.tour-client-list',
        content: 'Click on any client to view their detailed metrics, documents, and start a video call.',
        placement: 'right',
      },
    ]
  },
  admin: {
    '/admin-dashboard': [
      {
        target: 'body',
        content: 'Welcome Admin. This is your command center.',
        placement: 'center',
        disableBeacon: true,
      },
      {
        target: '.tour-platform-stats',
        content: 'Get a quick glance at total users, active subscriptions, and revenue.',
        placement: 'bottom',
      },
      {
        target: '.tour-manage-users',
        content: 'Switch to the Users tab to create new Experts and assign them to Clients.',
        placement: 'bottom',
      },
    ]
  }
};
