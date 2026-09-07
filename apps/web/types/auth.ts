export type OrganizationRole =
  | 'OWNER'
  | 'ADMIN'
  | 'MEMBER';

export interface User {
  id: string;
  email: string;

  firstName: string | null;
  lastName: string | null;

  avatarUrl?: string | null;

  emailVerified: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface Organization {
  id: string;

  name: string;
  slug: string;

  website?: string | null;
  industry?: string | null;

  role?: OrganizationRole;

  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  organization: Organization;
  accessToken: string;
}

export interface MeResponse {
  user: User;
  organization: Organization;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  businessName: string;

  firstName?: string;
  lastName?: string;
}