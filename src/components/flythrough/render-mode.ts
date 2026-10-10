"use client";

import { createContext, useContext } from "react";

/**
 * Panel render-mode contract.
 *  - "complete": flat pages. Show the final state: nothing scroll-stepped,
 *    animated in, or hidden behind progress (e.g. the AI diagram shows every
 *    step complete). Must need no JS interaction to read all content.
 *  - "staged": inside the fly-through stage; panels may step or animate.
 * New panels read it with `useRenderMode()` and default to "complete".
 */
export type RenderMode = "complete" | "staged";

export const RenderModeContext = createContext<RenderMode>("complete");

export const useRenderMode = (): RenderMode => useContext(RenderModeContext);
