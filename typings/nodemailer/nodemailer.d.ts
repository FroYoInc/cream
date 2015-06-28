// Type definitions for Nodemailer 1.3.2
// Project: https://github.com/andris9/Nodemailer
// Definitions by: Rogier Schouten <https://github.com/rogierschouten/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="../node/node.d.ts" />
/// <reference path="./nodemailer-types.d.ts" />
/// <reference path="../nodemailer-direct-transport/nodemailer-direct-transport.d.ts" />
/// <reference path="../nodemailer-smtp-transport/nodemailer-smtp-transport.d.ts" />

declare module "nodemailer" {

	import directTransport = require("nodemailer-direct-transport");
	import smtpTransport = require("nodemailer-smtp-transport");

	export type Transport = nodemailer.Transport;
	export type SendMailOptions = nodemailer.SendMailOptions;
	export type SentMessageInfo = nodemailer.SentMessageInfo;

	/**
	 * Transporter plugin
	 */
	export interface Plugin {
		(mail: SendMailOptions, callback?: (error: Error, info: SentMessageInfo) => void): void;
	}

	/**
	 * This is what you use to send mail
	 */
	export interface Transporter {
		/**
		 * Send a mail
		 */
		sendMail(mail: SendMailOptions, callback?: (error: Error, info: SentMessageInfo) => void): void;

		/**
		 * Attach a plugin. 'compile' and 'stream' plugins can be attached with use(plugin) method
		 *
		 * @param step is a string, either 'compile' or 'stream' thatd defines when the plugin should be hooked
		 * @param pluginFunc is a function that takes two arguments: the mail object and a callback function
		 */
		use(step: string, plugin: Plugin): void;


		/**
		 * Close all connections
		 */
		close?(): void;
	}

	/**
	 * Create a direct transporter
	 */
	export function createTransport(options?: directTransport.DirectOptions): Transporter;
	/**
	 * Create an SMTP transporter
	 */
	export function createTransport(options?: smtpTransport.SmtpOptions): Transporter;
	/**
	 * Create a transporter from a given implementation
	 */
	export function createTransport(transport: Transport): Transporter;

	/**
	 * The interface for defining authentication options for nodemailer.
	 */
	export interface TransporterAuthConfig
	{
	  /**
	   * The user name.
	   * @type {string}
	   */
	  user?: string;

	  /**
	   * The password.
	   * @type {string}
	   */
	  pass?: string;

	  /**
	   * The OAuth2 access token.
	   * @type {string}
	   */
	  xoauth2?: string;
	}

	/**
	 * The interface for defining email configuration options for nodemailer.
	 *
	 * Documentation found here:
	 * https://github.com/andris9/nodemailer-smtp-transport#usage
	 */
	export interface TransporterConfig
	{
	  /**
	   * The SMTP port, defaults to 25 or 465.
	   * @type {number}
	   */
	  port?: number;

	  /**
	   * The SMTP host, defaults to localhost.
	   * @type {string}
	   */
	  host?: string;

	  /**
	   * Whether the connection should use SSL, true for yes, false for no.
	   * @type {boolean}
	   */
	  secure?: boolean;

	  /**
	   * The authentication options for the SMTP connection.
	   *
	   * @type {TransporterAuthConfig}
	   */
	  auth?: TransporterAuthConfig;

	  /**
	   * Turns off STARTTLS support, if set to true.
	   * @type {boolean}
	   */
	  ignoreTLS?: boolean;

	  /**
	   * An optional host name, not required.
	   * @type {string}
	   */
	  name?: string;

	  /**
	   * The local interface to use for network connections.
	   * @type {string}
	   */
	  localAddress?: string;

	  /**
	   * The number of milliseconds after which attempting to connect to timeout.
	   * @type {number}
	   */
	  connectionTimeout?: number;

	  /**
	   * The number of milliseconds to wait for the greeting after connection.
	   * @type {number}
	   */
	  greetingTimeout?: number;

	  /**
	   * The time in milliseconds after which the connection is considered inactive.
	   * @type {number}
	   */
	  socketTimeout?: number;

	  /**
	   * If set to true, nodemailer will output logs to the console.
	   * @type {[type]}
	   */
	  debug?: boolean;

	  /**
	   * The preferred authentication method.
	   * @type {string}
	   */
	  authMethod?: string;

	  /**
	   * Any configuration options to pass to the socket constructor.
	   * @type {object}
	   */
	  tls?: any;

	  /**
	   * A version.
	   * @type {string}
	   */
	  version?: string;

	  /**
	   * A send callback.
	   * @type {(data: any, callback: () => void) => void}
	   */
	  send?: (data: any, callback: () => void) => void;
	}
}
