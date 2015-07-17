class Campus {
  private _name : string;
  private _id : string;
  private _address: Address;

  get name(): string {
  	return this._name;
  }

  set name(newName: string) {
  	this._name = newName;
  }

  get id(): string {
  	return this._id;
  }

  set id(newId: string) {
  	this._id = newId;
  }

  get address(): Address {
  	return this._address;
  }

  set location(newLocation: Address) {
  	this._address = newLocation;
  }
}
