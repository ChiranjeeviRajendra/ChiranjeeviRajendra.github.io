// Keep the legacy hash URLs so existing bookmarks continue to work.
export const navigation = [
  { path: '/home', label: 'Home', icon: 'm3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9' },
  { path: '/personalDetails', label: 'Personal Details', icon: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2' },
  { path: '/skills', label: 'Skills', icon: 'm8 5-6 7 6 7m8-14 6 7-6 7M14 3l-4 18' },
  { path: '/experience', label: 'Experience', icon: 'M3 4h18v16H3ZM3 9h18M7 13h4m-4 3h10' },
  { path: '/projects', label: 'Projects', icon: 'M3 7h18v14H3ZM8 7V3h8v4M3 12h18m-11 0v3h4v-3' },
  { path: '/education', label: 'Education', icon: 'm2 8 10-5 10 5-10 5-10-5Zm4 2v7l6 4 6-4v-7m4-2v9' },
  { path: '/contact', label: 'Contact', icon: 'M5 3h4l2 5-3 2a16 16 0 0 0 6 6l2-3 5 2v4c0 2-2 3-4 2C9 19 5 15 3 7 2 5 3 3 5 3Z' },
]

export const sectionComponents = {
  personalDetails: () => import('./about-me/AboutMe.vue'),
  skills: () => import('./skills/Skills.vue'),
  experience: () => import('./experience/Experience.vue'),
  projects: () => import('./projects/Projects.vue'),
  education: () => import('./education/Education.vue'),
  contact: () => import('./contact/Contact.vue'),
}

export const routes = [
  { path: '/', alias: '/home', component: () => import('./home/Home.vue') },
  ...Object.entries(sectionComponents).map(([path, component]) => ({ path: `/${path}`, component })),
  { path: '/:pathMatch(.*)*', redirect: '/' },
]
