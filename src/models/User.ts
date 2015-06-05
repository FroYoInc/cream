class User {
  private _firstName : string;
  private _lastName : string;
  private _userName : string;
  private _passwordHash : string;
  private _email : string;
  private _isAccountActivated : boolean;
  private _salt : string;
  private _id : string;
  private _carpools : [Carpool];

  get firstName(): string {
    return this._firstName;
  }

  set firstName(newName: string) {
    this._firstName = newName;
  }

  get lastName(): string {
    return this._lastName;
  }

  set lastName(newLastName: string) {
      this._lastName = newLastName;
  }

  get userName(): string {
    return this._userName;
  }

  set userName(newUserName: string) {
    this._userName = newUserName;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  set passwordHash(newPasswordHash: string) {
    this._passwordHash = newPasswordHash;
  }

  get email(): string {
    return this._email;
  }

  set email(newEmail: string){
    this._email = newEmail;
  }

  get isAccountActivated(): boolean {
    return this._isAccountActivated;
  }

  set isAccountActivated(newStatus: boolean) {
    this._isAccountActivated = newStatus;
  }

  get salt(): string {
    return this._salt;
  }

  set salt(newSalt: string) {
    this._salt = newSalt;
  }

  get id(): string{
    return this._id;
  }

  set id(newID:string) {
    this._id = newID;
  }

  get carPools(): [Carpool] {
    return this._carpools;
  }

  set carPools(newCarpools: [Carpool]) {
    this._carpools = newCarpools;
  }
}
