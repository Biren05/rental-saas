export class UserEntity {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
