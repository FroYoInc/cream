module Models {

  export interface GeoCode {
    lat: number;
    long: number;
  }

  export interface Address {
    address: string;
    geoCode: GeoCode;
  }

  export interface Campus {
    name: string;
    address: Address;
    id?: string;
  }

  export interface Carpool {
    name: string;
    owner: User;
    // Owner is a participant by default. Hence participants have at least 1
    // user
    participants: [User];
    campus: Campus;
    description: string;
    id?: string;
  }

  export interface User {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    isAccountActivated: boolean;
    passwordHash: string;
    salt: string;
    id?: string;
    // carpools?: Array<Models.Carpool>;
  }

  export interface UserData {
    id: string;
    activationCode: string;
    numLoginAttempts: number;
    lockoutExpiration: number;
  }

  export interface Activation {
    id: string;
    userId: string;
  }
}

export = Models;
