import { describe, it, expect, beforeEach, vi, type Mock } from 'bun:test'
import { RestaurantService } from '../../src/services/restaurant/restaurant.service'
import { RestaurantRepository } from '../../src/repositories/restaurant.repository'
import { RestaurantAlreadyExistsError, RestaurantValidationError } from '../../src/services/restaurant/exceptions'
import type { PgTransaction } from 'drizzle-orm/pg-core'

// ============================================================================
// Types
// ============================================================================

type Transaction = PgTransaction<any, any, any>

interface User {
  id: string
  name: string
  email: string
  phone: string
  userRole: string
  createdAt: Date
  updatedAt: Date | null
}

interface Restaurant {
  id: string
  name: string
  managerId: string
  description: string
  createdAt: Date
  updatedAt: Date | null
}

// ============================================================================
// Test Data Factories
// ============================================================================

const createValidInput = (overrides = {}) => ({
  restaurantName: 'Pizza Palace',
  name: 'John Doe',
  email: 'john@example.com', // Email simples que passa no regex
  phone: '1234567890',
  ...overrides,
})

const createMockManager = (overrides: Partial<User> = {}): User => ({
  id: 'manager-id',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '1234567890',
  userRole: 'manager',
  createdAt: new Date('2024-01-01'),
  updatedAt: null,
  ...overrides,
})

const createMockRestaurant = (overrides: Partial<Restaurant> = {}): Restaurant => ({
  id: 'restaurant-id',
  name: 'Pizza Palace',
  managerId: 'manager-id',
  description: '',
  createdAt: new Date('2024-01-01'),
  updatedAt: null,
  ...overrides,
})

// ============================================================================
// Mock Repository Setup
// ============================================================================

const createMockRepository = () => {
  const mockRepository = {
    findRestaurantByName: vi.fn(),
    findRestaurantById: vi.fn(),
    findRestaurantByManagerId: vi.fn(),
    findUserById: vi.fn(),
    listRestaurants: vi.fn(),
    transaction: vi.fn(),
    createUser: vi.fn(),
    createRestaurant: vi.fn(),
    updateRestaurant: vi.fn(),
    updateUser: vi.fn(),
    deleteRestaurant: vi.fn(),
  }

  return mockRepository as unknown as RestaurantRepository
}

// ============================================================================
// Tests
// ============================================================================

describe('RestaurantService', () => {
  let restaurantService: RestaurantService
  let mockRepository: ReturnType<typeof createMockRepository>

  beforeEach(() => {
    mockRepository = createMockRepository()
    restaurantService = new RestaurantService(mockRepository)
    vi.clearAllMocks()
  })

  describe('createRestaurant', () => {
    describe('Success Cases', () => {
      it('should create a restaurant successfully with valid data', async () => {
        const input = createValidInput()
        const mockManager = createMockManager()
        const mockRestaurant = createMockRestaurant()

        ;(mockRepository.findRestaurantByName as Mock).mockResolvedValue(null)
        ;(mockRepository.transaction as Mock).mockImplementation(async (callback) => {
          const mockTrx = {} as Transaction
          
          // Mock das funções que serão chamadas dentro da transação
          ;(mockRepository.createUser as Mock).mockResolvedValue(mockManager)
          ;(mockRepository.createRestaurant as Mock).mockResolvedValue(mockRestaurant)
          
          return callback(mockTrx)
        })

        const result = await restaurantService.createRestaurant(input)

        expect(result).toEqual({
          id: mockRestaurant.id,
          restaurantName: mockRestaurant.name,
          managerId: mockManager.id,
          createdAt: mockRestaurant.createdAt,
        })

        expect(mockRepository.findRestaurantByName).toHaveBeenCalledWith(input.restaurantName)
        expect(mockRepository.findRestaurantByName).toHaveBeenCalledTimes(1)
        expect(mockRepository.transaction).toHaveBeenCalledTimes(1)
        expect(mockRepository.createUser).toHaveBeenCalledWith(
          {
            name: input.name,
            email: input.email,
            phone: input.phone,
          },
          expect.anything() // transaction object
        )
        expect(mockRepository.createRestaurant).toHaveBeenCalledWith(
          {
            restaurantName: input.restaurantName,
            managerId: mockManager.id,
          },
          expect.anything() // transaction object
        )
      })

      it('should handle restaurant creation with minimum valid values', async () => {
        const input = createValidInput({
          restaurantName: 'ABC',
          name: 'Joe',
          phone: '1234567890', // 10 digits - minimum
        })
        const mockManager = createMockManager({ name: input.name })
        const mockRestaurant = createMockRestaurant({ name: input.restaurantName })

        ;(mockRepository.findRestaurantByName as Mock).mockResolvedValue(null)
        ;(mockRepository.transaction as Mock).mockImplementation(async (callback) => {
          ;(mockRepository.createUser as Mock).mockResolvedValue(mockManager)
          ;(mockRepository.createRestaurant as Mock).mockResolvedValue(mockRestaurant)
          return callback({} as Transaction)
        })

        const result = await restaurantService.createRestaurant(input)

        expect(result).toHaveProperty('id')
        expect(result.restaurantName).toBe(input.restaurantName)
      })

      it('should accept phone with formatting characters', async () => {
        const input = createValidInput({
          phone: '(12) 34567-8901', // 11 digits with formatting
        })
        const mockManager = createMockManager()
        const mockRestaurant = createMockRestaurant()

        ;(mockRepository.findRestaurantByName as Mock).mockResolvedValue(null)
        ;(mockRepository.transaction as Mock).mockImplementation(async (callback) => {
          ;(mockRepository.createUser as Mock).mockResolvedValue(mockManager)
          ;(mockRepository.createRestaurant as Mock).mockResolvedValue(mockRestaurant)
          return callback({} as Transaction)
        })

        const result = await restaurantService.createRestaurant(input)

        expect(result).toHaveProperty('id')
      })
    })

    describe('Validation Errors', () => {
      it('should throw RestaurantValidationError for restaurant name too short', async () => {
        const input = createValidInput({ restaurantName: 'AB' })

        await expect(restaurantService.createRestaurant(input)).rejects.toThrow(
          RestaurantValidationError
        )

        expect(mockRepository.findRestaurantByName).not.toHaveBeenCalled()
      })

      it('should throw RestaurantValidationError for empty restaurant name', async () => {
        const input = createValidInput({ restaurantName: '   ' })

        await expect(restaurantService.createRestaurant(input)).rejects.toThrow(
          RestaurantValidationError
        )

        expect(mockRepository.findRestaurantByName).not.toHaveBeenCalled()
      })

      it('should throw RestaurantValidationError for manager name too short', async () => {
        const input = createValidInput({ name: 'Jo' })

        await expect(restaurantService.createRestaurant(input)).rejects.toThrow(
          RestaurantValidationError
        )

        expect(mockRepository.findRestaurantByName).not.toHaveBeenCalled()
      })

      it('should throw RestaurantValidationError for invalid email format', async () => {
        const input = createValidInput({ email: 'invalid-email' })

        await expect(restaurantService.createRestaurant(input)).rejects.toThrow(
          RestaurantValidationError
        )

        expect(mockRepository.findRestaurantByName).not.toHaveBeenCalled()
      })

      it('should throw RestaurantValidationError for email without @', async () => {
        const input = createValidInput({ email: 'invalidemail.com' })

        await expect(restaurantService.createRestaurant(input)).rejects.toThrow(
          RestaurantValidationError
        )

        expect(mockRepository.findRestaurantByName).not.toHaveBeenCalled()
      })

      it('should throw RestaurantValidationError for phone too short', async () => {
        const input = createValidInput({ phone: '123456789' }) // 9 digits

        await expect(restaurantService.createRestaurant(input)).rejects.toThrow(
          RestaurantValidationError
        )

        expect(mockRepository.findRestaurantByName).not.toHaveBeenCalled()
      })

      it('should throw RestaurantValidationError for phone too long', async () => {
        const input = createValidInput({ phone: '1234567890123456' }) // 16 digits

        await expect(restaurantService.createRestaurant(input)).rejects.toThrow(
          RestaurantValidationError
        )

        expect(mockRepository.findRestaurantByName).not.toHaveBeenCalled()
      })

      it('should throw RestaurantValidationError with multiple errors combined', async () => {
        const input = {
          restaurantName: 'AB',
          name: 'Jo',
          email: 'invalid-email',
          phone: '123',
        }

        try {
          await restaurantService.createRestaurant(input)
          throw new Error('Should have thrown RestaurantValidationError')
        } catch (error) {
          expect(error).toBeInstanceOf(RestaurantValidationError)
          expect(error.message).toContain('Nome do restaurante')
          expect(error.message).toContain('Nome do gerente')
          expect(error.message).toContain('Email inválido')
          expect(error.message).toContain('Telefone inválido')
        }
      })
    })

    describe('Business Logic Errors', () => {
      it('should throw RestaurantAlreadyExistsError if restaurant name already exists', async () => {
        const input = createValidInput()
        const existingRestaurant = createMockRestaurant({ name: input.restaurantName })

        ;(mockRepository.findRestaurantByName as Mock).mockResolvedValue(existingRestaurant)

        await expect(restaurantService.createRestaurant(input)).rejects.toThrow(
          RestaurantAlreadyExistsError
        )

        expect(mockRepository.findRestaurantByName).toHaveBeenCalledWith(input.restaurantName)
        expect(mockRepository.findRestaurantByName).toHaveBeenCalledTimes(1)
        expect(mockRepository.transaction).not.toHaveBeenCalled()
      })

      it('should throw RestaurantValidationError if manager creation fails', async () => {
        const input = createValidInput()

        ;(mockRepository.findRestaurantByName as Mock).mockResolvedValue(null)
        ;(mockRepository.transaction as Mock).mockImplementation(async (callback) => {
          ;(mockRepository.createUser as Mock).mockResolvedValue(null)
          return callback({} as Transaction)
        })

        try {
          await restaurantService.createRestaurant(input)
          throw new Error('Should have thrown RestaurantValidationError')
        } catch (error) {
          expect(error).toBeInstanceOf(RestaurantValidationError)
          expect(error.message).toContain('Falha ao criar gerente')
        }
      })

      it('should throw RestaurantValidationError if manager has no id', async () => {
        const input = createValidInput()
        const managerWithoutId = { ...createMockManager(), id: '' }

        ;(mockRepository.findRestaurantByName as Mock).mockResolvedValue(null)
        ;(mockRepository.transaction as Mock).mockImplementation(async (callback) => {
          ;(mockRepository.createUser as Mock).mockResolvedValue(managerWithoutId)
          return callback({} as Transaction)
        })

        await expect(restaurantService.createRestaurant(input)).rejects.toThrow(
          RestaurantValidationError
        )
      })

      it('should throw RestaurantValidationError if restaurant creation fails', async () => {
        const input = createValidInput()
        const mockManager = createMockManager()

        ;(mockRepository.findRestaurantByName as Mock).mockResolvedValue(null)
        ;(mockRepository.transaction as Mock).mockImplementation(async (callback) => {
          ;(mockRepository.createUser as Mock).mockResolvedValue(mockManager)
          ;(mockRepository.createRestaurant as Mock).mockResolvedValue(null)
          return callback({} as Transaction)
        })

        try {
          await restaurantService.createRestaurant(input)
          throw new Error('Should have thrown RestaurantValidationError')
        } catch (error) {
          expect(error).toBeInstanceOf(RestaurantValidationError)
          expect(error.message).toContain('Falha ao criar restaurante')
        }
      })

      it('should throw RestaurantValidationError if restaurant has no id', async () => {
        const input = createValidInput()
        const mockManager = createMockManager()
        const restaurantWithoutId = { ...createMockRestaurant(), id: '' }

        ;(mockRepository.findRestaurantByName as Mock).mockResolvedValue(null)
        ;(mockRepository.transaction as Mock).mockImplementation(async (callback) => {
          ;(mockRepository.createUser as Mock).mockResolvedValue(mockManager)
          ;(mockRepository.createRestaurant as Mock).mockResolvedValue(restaurantWithoutId)
          return callback({} as Transaction)
        })

        await expect(restaurantService.createRestaurant(input)).rejects.toThrow(
          RestaurantValidationError
        )
      })
    })

    describe('Error Handling', () => {
      it('should wrap unexpected errors in generic error message', async () => {
        const input = createValidInput()

        ;(mockRepository.findRestaurantByName as Mock).mockRejectedValue(
          new Error('Database connection failed')
        )

        await expect(restaurantService.createRestaurant(input)).rejects.toThrow(
          'Erro interno ao criar restaurante. Por favor, tente novamente.'
        )
      })

      it('should not wrap RestaurantValidationError', async () => {
        const input = createValidInput({ restaurantName: 'AB' })

        await expect(restaurantService.createRestaurant(input)).rejects.toThrow(
          RestaurantValidationError
        )
      })

      it('should not wrap RestaurantAlreadyExistsError', async () => {
        const input = createValidInput()
        ;(mockRepository.findRestaurantByName as Mock).mockResolvedValue(
          createMockRestaurant()
        )

        await expect(restaurantService.createRestaurant(input)).rejects.toThrow(
          RestaurantAlreadyExistsError
        )
      })
    })
  })

  describe('getRestaurantById', () => {
    it('should return a restaurant if found', async () => {
      const restaurantId = 'restaurant-id'
      const mockRestaurant = createMockRestaurant({ id: restaurantId })

      ;(mockRepository.findRestaurantById as Mock).mockResolvedValue(mockRestaurant)

      const result = await restaurantService.getRestaurantById(restaurantId)

      expect(result).toEqual(mockRestaurant)
      expect(mockRepository.findRestaurantById).toHaveBeenCalledWith(restaurantId)
      expect(mockRepository.findRestaurantById).toHaveBeenCalledTimes(1)
    })

    it('should throw RestaurantValidationError if restaurant not found', async () => {
      const restaurantId = 'non-existent-id'

      ;(mockRepository.findRestaurantById as Mock).mockResolvedValue(null)

      try {
        await restaurantService.getRestaurantById(restaurantId)
        throw new Error('Should have thrown RestaurantValidationError')
      } catch (error) {
        expect(error).toBeInstanceOf(RestaurantValidationError)
        expect(error.message).toContain(`Restaurante ${restaurantId} não encontrado`)
      }

      expect(mockRepository.findRestaurantById).toHaveBeenCalledWith(restaurantId)
    })

    it('should wrap repository errors in generic error message', async () => {
      const restaurantId = 'restaurant-id'

      ;(mockRepository.findRestaurantById as Mock).mockRejectedValue(
        new Error('Database error')
      )

      await expect(restaurantService.getRestaurantById(restaurantId)).rejects.toThrow(
        'Erro ao buscar restaurante'
      )
    })

    it('should not wrap RestaurantValidationError', async () => {
      const restaurantId = 'restaurant-id'

      ;(mockRepository.findRestaurantById as Mock).mockResolvedValue(null)

      await expect(restaurantService.getRestaurantById(restaurantId)).rejects.toThrow(
        RestaurantValidationError
      )
    })
  })

  describe('getManagedRestaurant', () => {
    it('should return a managed restaurant if found', async () => {
      const restaurantId = 'restaurant-id'
      const mockRestaurant = createMockRestaurant({ id: restaurantId })

      ;(mockRepository.findRestaurantById as Mock).mockResolvedValue(mockRestaurant)

      const result = await restaurantService.getManagedRestaurant(restaurantId)

      expect(result).toEqual(mockRestaurant)
      expect(mockRepository.findRestaurantById).toHaveBeenCalledWith(restaurantId)
      expect(mockRepository.findRestaurantById).toHaveBeenCalledTimes(1)
    })

    it('should throw RestaurantValidationError if restaurantId is null', async () => {
      await expect(restaurantService.getManagedRestaurant(null as any)).rejects.toThrow(
        RestaurantValidationError
      )

      expect(mockRepository.findRestaurantById).not.toHaveBeenCalled()
    })

    it('should throw RestaurantValidationError if restaurantId is undefined', async () => {
      await expect(restaurantService.getManagedRestaurant(undefined as any)).rejects.toThrow(
        RestaurantValidationError
      )

      expect(mockRepository.findRestaurantById).not.toHaveBeenCalled()
    })

    it('should throw RestaurantValidationError if restaurantId is empty string', async () => {
      await expect(restaurantService.getManagedRestaurant('')).rejects.toThrow(
        RestaurantValidationError
      )

      expect(mockRepository.findRestaurantById).not.toHaveBeenCalled()
    })

    it('should throw RestaurantValidationError if restaurant not found', async () => {
      const restaurantId = 'non-existent-id'

      ;(mockRepository.findRestaurantById as Mock).mockResolvedValue(null)

      try {
        await restaurantService.getManagedRestaurant(restaurantId)
        throw new Error('Should have thrown RestaurantValidationError')
      } catch (error) {
        expect(error).toBeInstanceOf(RestaurantValidationError)
        expect(error.message).toContain(`Restaurante ${restaurantId} não encontrado`)
      }

      expect(mockRepository.findRestaurantById).toHaveBeenCalledWith(restaurantId)
    })

    it('should throw error if repository fails', async () => {
      const restaurantId = 'restaurant-id'

      ;(mockRepository.findRestaurantById as Mock).mockRejectedValue(
        new Error('Database error')
      )

      await expect(restaurantService.getManagedRestaurant(restaurantId)).rejects.toThrow()
    })
  })

  describe('listRestaurants', () => {
    it('should return paginated list of restaurants', async () => {
      const options = { page: 1, limit: 10 }
      const mockRestaurants = {
        data: [
          createMockRestaurant({ id: '1', name: 'Restaurant 1' }),
          createMockRestaurant({ id: '2', name: 'Restaurant 2' }),
        ],
        total: 2,
      }

      ;(mockRepository.listRestaurants as Mock).mockResolvedValue(mockRestaurants)

      const result = await restaurantService.listRestaurants(options)

      expect(result).toEqual(mockRestaurants)
      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(mockRepository.listRestaurants).toHaveBeenCalledWith(options)
      expect(mockRepository.listRestaurants).toHaveBeenCalledTimes(1)
    })

    it('should return empty array when no restaurants exist', async () => {
      const options = { page: 1, limit: 10 }
      const emptyResult = { data: [], total: 0 }

      ;(mockRepository.listRestaurants as Mock).mockResolvedValue(emptyResult)

      const result = await restaurantService.listRestaurants(options)

      expect(result.data).toEqual([])
      expect(result.data).toHaveLength(0)
      expect(result.total).toBe(0)
    })

    it('should handle different page numbers', async () => {
      const options = { page: 2, limit: 5 }
      const mockRestaurants = {
        data: [createMockRestaurant()],
        total: 10,
      }

      ;(mockRepository.listRestaurants as Mock).mockResolvedValue(mockRestaurants)

      const result = await restaurantService.listRestaurants(options)

      expect(result).toEqual(mockRestaurants)
      expect(mockRepository.listRestaurants).toHaveBeenCalledWith(options)
    })

    it('should handle different limit sizes', async () => {
      const options = { page: 1, limit: 50 }
      const mockRestaurants = {
        data: Array.from({ length: 50 }, (_, i) =>
          createMockRestaurant({ id: `${i + 1}`, name: `Restaurant ${i + 1}` })
        ),
        total: 100,
      }

      ;(mockRepository.listRestaurants as Mock).mockResolvedValue(mockRestaurants)

      const result = await restaurantService.listRestaurants(options)

      expect(result.data).toHaveLength(50)
      expect(result.total).toBe(100)
    })

    it('should throw error if repository fails', async () => {
      const options = { page: 1, limit: 10 }

      ;(mockRepository.listRestaurants as Mock).mockRejectedValue(
        new Error('Database error')
      )

      await expect(restaurantService.listRestaurants(options)).rejects.toThrow(
        'Erro ao listar restaurantes'
      )
    })

    it('should handle large page numbers', async () => {
      const options = { page: 999, limit: 10 }
      const emptyResult = { data: [], total: 50 }

      ;(mockRepository.listRestaurants as Mock).mockResolvedValue(emptyResult)

      const result = await restaurantService.listRestaurants(options)

      expect(result.data).toHaveLength(0)
      expect(result.total).toBe(50)
    })
  })
})