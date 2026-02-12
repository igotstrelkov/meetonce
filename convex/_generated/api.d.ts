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
import type * as chat from "../chat.js";
import type * as coffeeShops from "../coffeeShops.js";
import type * as crons from "../crons.js";
import type * as emails from "../emails.js";
import type * as feedback from "../feedback.js";
import type * as lib_googlePlaces from "../lib/googlePlaces.js";
import type * as lib_matching from "../lib/matching.js";
import type * as lib_openrouter from "../lib/openrouter.js";
import type * as lib_utils from "../lib/utils.js";
import type * as lib_vapi from "../lib/vapi.js";
import type * as matches from "../matches.js";
import type * as matching from "../matching.js";
import type * as notifications from "../notifications.js";
import type * as pushActions from "../pushActions.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";
import type * as voice from "../voice.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  chat: typeof chat;
  coffeeShops: typeof coffeeShops;
  crons: typeof crons;
  emails: typeof emails;
  feedback: typeof feedback;
  "lib/googlePlaces": typeof lib_googlePlaces;
  "lib/matching": typeof lib_matching;
  "lib/openrouter": typeof lib_openrouter;
  "lib/utils": typeof lib_utils;
  "lib/vapi": typeof lib_vapi;
  matches: typeof matches;
  matching: typeof matching;
  notifications: typeof notifications;
  pushActions: typeof pushActions;
  seed: typeof seed;
  users: typeof users;
  voice: typeof voice;
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
