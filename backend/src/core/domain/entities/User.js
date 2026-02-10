/**
 * User Entity - Representa un usuario en el sistema
 */
export class User {
  constructor({
    id,
    email,
    password,
    firstName,
    lastName,
    phone,
    role = 'CUSTOMER',
    isActive = true,
    emailVerified = false,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.role = role;
    this.isActive = isActive;
    this.emailVerified = emailVerified;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  isAdmin() {
    return this.role === 'ADMIN';
  }

  isMechanic() {
    return this.role === 'MECHANIC';
  }

  isCustomer() {
    return this.role === 'CUSTOMER';
  }

  canManageServices() {
    return this.role === 'ADMIN' || this.role === 'MECHANIC';
  }

  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}
