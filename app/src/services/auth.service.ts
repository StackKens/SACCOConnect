import { api } from "./api";

export interface LoginCredentials {
  email: string;
  password: string;
}
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    // Mock - replace with real endpoint
    return {
      data: {
        user: {
          id: "1",
          name: "John Doe",
          email: credentials.email,
          role: "member",
        },
        token: "mock-token",
      },
    };
  },
  register: async (data: RegisterData) => {
    return {
      data: {
        user: { id: "2", name: data.name, email: data.email, role: "member" },
        token: "mock-token",
      },
    };
  },
  logout: async () => {
    // await api.post('/auth/logout');
  },
};
