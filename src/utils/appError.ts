export class AppError extends Error {
  public statusCode: number; // Indispensable pour l'accès dans le middleware
  public status: string;
  public details?: any;

  constructor(statusCode: number, status: string, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.status = status;
    this.details = details;
    
    // Assure que l'instance est bien liée à la classe (utile pour certains environnements)
    Object.setPrototypeOf(this, AppError.prototype);
  }
}