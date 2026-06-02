import axios from 'axios'

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.detail || 'Error de red'
    return Promise.reject(new Error(msg))
  }
)

export default api

export const gamesService = {
  popular: (params) => api.get('/api/games/rawg/popular', { params }),
  search: (q, page = 1) => api.get('/api/games/rawg/search', { params: { q, page, page_size: 12 } }),
  detail: (id) => api.get(`/api/games/rawg/${id}`),
  genres: () => api.get('/api/games/rawg/genres/list'),
  save: (data) => api.post('/api/games/save', data),
  saved: () => api.get('/api/games/saved'),
  favorites: {
    list: () => api.get('/api/games/favorites/me'),
    add: (id) => api.post(`/api/games/favorites/${id}`),
    remove: (id) => api.delete(`/api/games/favorites/${id}`),
  }
}

export const reviewsService = {
  byGame: (gameId) => api.get(`/api/reviews/game/${gameId}`),
  mine: () => api.get('/api/reviews/me'),
  create: (data) => api.post('/api/reviews/', data),
  update: (id, data) => api.put(`/api/reviews/${id}`, data),
  delete: (id) => api.delete(`/api/reviews/${id}`),
}
