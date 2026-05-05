import axios from 'axios'

const axiosInstance = axios.create({ baseURL: '/api' })

// Request interceptor: attach token
axiosInstance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('retail_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (e) {
    // ignore
  }
  return config
})

// Response interceptor: handle 401
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      try {
        localStorage.removeItem('retail_token')
        localStorage.removeItem('retail_user')
      } catch (e) {}
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default axiosInstance
