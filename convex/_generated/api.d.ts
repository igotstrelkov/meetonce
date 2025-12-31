/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as crons from "../crons.js";
import type * as emails from "../emails.js";
import type * as feedback from "../feedback.js";
import type * as lib_matching from "../lib/matching.js";
import type * as lib_openrouter from "../lib/openrouter.js";
import type * as lib_utils from "../lib/utils.js";
import type * as matches from "../matches.js";
import type * as matching from "../matching.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  crons: typeof crons;
  emails: typeof emails;
  feedback: typeof feedback;
  "lib/matching": typeof lib_matching;
  "lib/openrouter": typeof lib_openrouter;
  "lib/utils": typeof lib_utils;
  matches: typeof matches;
  matching: typeof matching;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
