import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: (to) => {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/DefaultLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
          meta: { title: 'Thư viện số AI • STEM' },
        },
        {
          path: 'tu-sach-3d',
          name: 'three-d-library',
          component: () => import('@/views/ThreeDLibraryView.vue'),
          meta: { title: 'Tủ sách 3D' },
        },
        {
          path: 'sach-noi',
          name: 'audiobooks',
          component: () => import('@/views/MediaLibraryView.vue'),
          meta: { title: 'Sách nói' },
        },
        {
          path: 'video-bai-giang',
          name: 'video-lessons',
          component: () => import('@/views/MediaLibraryView.vue'),
          meta: { title: 'Video bài giảng' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Không tìm thấy trang' },
    },
  ],
})

router.afterEach((to) => {
  const appName = import.meta.env.VITE_APP_NAME || 'Thư viện số'
  document.title = to.meta.title ? `${String(to.meta.title)} · ${appName}` : appName
})

export default router
