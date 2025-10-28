import { AuthLink } from './auth-link.entity'

export interface IAuthLinkRepository {
  create(authLink: Omit<AuthLink, 'id' | 'createdAt'>): Promise<AuthLink>
  findByCode(code: string): Promise<AuthLink | null>
  delete(code: string): Promise<void>
}
