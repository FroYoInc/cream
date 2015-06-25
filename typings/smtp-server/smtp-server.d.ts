declare module "smtp-server" {

  /**
   * The SMTP Server class for making quick and easy SMTP servers.
   */
  class SMTPServer {
    /**
     * Initializes the SMTP server.
     *
     * @param  {SMTPServerOptions} options The SMTP server options.
     */
    constructor(options: SMTPServerOptions);

    /**
     * Starts the SMTP server on the specified port and host.
     *
     * @param  {number} port     The port number.
     * @param  {any}    host     The host or a callback.
     * @param  {any}    callback A callback.
     */
    listen(port: number, host?: any, callback?: any);

    /**
     * Closes the SMTP server.
     *
     * @param  {()  => void}        callback A callback.
     */
    close(callback?: () => void);
  }

  /**
   * SMTP Server options, not necessarily all inclusive.
   */
  interface SMTPServerOptions {
    authMethods: Array<string>;
    disabledCommands: Array<string>;
    onData: (stream: any, session: any, callback: (arg1: any, arg2: any) => void) => void;
    onAuth: (auth: any, session: any, callback: (arg1: any, arg2?: any) => any) => any;
    onMailFrom: (address: any, session: any, callback: (arg1?: any) => any) => any;
    onRcptTo: (address: any, session: any, callback: (arg1?: any) => any) => any;
    logger: any;
  }
}
