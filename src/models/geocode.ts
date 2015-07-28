class GeoCode {
  private _lat: number;
  private _long: number;

  get lat(): number {
    return this._lat;
  }

  set lat(lat: number) {
    this._lat = lat;
  }

  get long(): number {
    return this._long;
  }

  set long(long: number) {
    this._long = long;
  }
}
