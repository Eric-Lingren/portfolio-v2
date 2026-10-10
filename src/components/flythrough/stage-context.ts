"use client";

import { createContext } from "react";

/** True while panels render inside the fly-through stage (enables the build wipe). */
export const StageContext = createContext(false);
