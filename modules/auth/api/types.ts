export interface LoginResponse {
  access_token: string;
  user: any; // Define a more specific type if possible
}

export interface LoginVariables {
  idToken: string;
}
