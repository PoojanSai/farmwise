import api from './axios'

// Auth
export const authAPI = {
    register: (data) => api.post('/auth/register/', data),
    login: (data) => api.post('/auth/login/', data),
    getProfile: () => api.get('/auth/profile/'),
    updateProfile: (data) => api.put('/auth/profile/', data),
    getLands: () => api.get('/auth/lands/'),
    addLand: (data) => api.post('/auth/lands/', data),
}

// Soil
export const soilAPI = {
    getReports: () => api.get('/soil/reports/'),
    addReport: (data) => api.post('/soil/reports/', data),
    getLatest: () => api.get('/soil/reports/latest/'),
    getSummary: () => api.get('/soil/reports/summary/'),
}

// Crops
export const cropsAPI = {
    recommend: (data) => api.post('/crops/recommend-crop/', data),
    getRecommendations: () => api.get('/crops/recommendations/'),
    getListings: (params) => api.get('/crops/listings/', { params }),
    addListing: (data) => api.post('/crops/listings/', data),
    myListings: () => api.get('/crops/listings/my_listings/'),
    addBuyerInterest: (data) => api.post('/crops/buyer-interests/', data),
}

// Experts
export const expertsAPI = {
    getExperts: (params) => api.get('/experts/experts/', { params }),
    getExpert: (id) => api.get(`/experts/experts/${id}/`),
    bookAppointment: (data) => api.post('/experts/appointments/', data),
    getAppointments: () => api.get('/experts/appointments/'),
    getUpcoming: () => api.get('/experts/appointments/upcoming/'),
    getMessages: (appointmentId) => api.get('/experts/messages/', { params: { appointment: appointmentId } }),
    sendMessage: (data) => api.post('/experts/messages/', data),
}

// Marketplace
export const marketplaceAPI = {
    getCategories: () => api.get('/marketplace/categories/'),
    getProducts: (params) => api.get('/marketplace/products/', { params }),
    getProduct: (id) => api.get(`/marketplace/products/${id}/`),
    placeOrder: (data) => api.post('/marketplace/orders/', data),
    getOrders: () => api.get('/marketplace/orders/'),
}

// Analytics
export const analyticsAPI = {
    getOverview: () => api.get('/analytics/overview/'),
}

// Companies
export const companiesAPI = {
    getCompanies: (params) => api.get('/companies/companies/', { params }),
    registerCompany: (data) => api.post('/companies/companies/', data),
    getInterests: () => api.get('/companies/purchase-interests/'),
}
