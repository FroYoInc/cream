class RequestHandler {
  url : string;
  constructor(_url) {
    this.url = _url;
  }
}


var r = new RequestHandler("asd");
var p = r.url;
