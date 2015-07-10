class Address {
  private _address: string;
  private _geoCode: GeoCode;

  get address(): string {
    return this._address;
  }

  set address(address: string) {
    this._address = address;
  }

  get geoCode(): GeoCode {
    return this._geoCode;
  }

  set geoCode(geoCode: GeoCode) {
    this._geoCode = geoCode;
  }
}
