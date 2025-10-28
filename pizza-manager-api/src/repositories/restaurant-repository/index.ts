export interface CreateRestaurantData {
  restaurantName: string
  managerId: string
}

export interface CreateUserData {
  name: string
  email: string
  phone: string
}


export interface Restaurant {
  id: string
  name: string
  managerId: string
  description: string
  createdAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  userRole: string
  createdAt: Date
}