// After version 1 refactor this into its own file
class GeoCode {
  x: number;
  y: number;
}

class Campus {
  private _name : string;
  private _id : string;
  private _location: GeoCode;

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

  get location(): GeoCode {
  	return this._location;
  }

  set location(newLocation: GeoCode) {
  	this._location = newLocation;
  }  
}
