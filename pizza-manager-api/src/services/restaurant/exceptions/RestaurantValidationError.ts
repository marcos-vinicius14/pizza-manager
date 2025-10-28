export class RestaurantValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RestaurantValidationError'
  }
}
