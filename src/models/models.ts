module Models {
  export interface GeoCode {
    x: number;
    y: number;
  }

  export interface Campus {
    name: string;
    id: string;
    location: Models.GeoCode
  }

  export interface Carpool {
    name: string;
    users: Array<Models.User>;
    campus: Campus;
    description: string;
    id: string;
  }

  export interface User {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    isAccountActivated: boolean;
    passwordHash?: string;
    salt?: string;
    id?: string;
    carpools?: Array<Models.Carpool>
  }

  export interface UserData {
    id: string;
    activationCode: string;
  }

  export interface Activation {
    id: string;
    userId: string;
  }
}

export = Models;
