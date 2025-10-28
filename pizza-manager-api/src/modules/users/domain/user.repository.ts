import { User } from './user.entity'

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>
}
