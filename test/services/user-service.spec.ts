import services = require('../../src/services/user-service');
var userService = new services.UserService();
describe('User service', () => {
  it('contains spec with expectation', () => {
    expect(userService.getUserById('')).toBe(false);
  });
});
