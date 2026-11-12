"use client";

import { createContext, useContext } from "react";

/** D-041, D-043: lets a checkpoint or question tell its stage about a wrong answer, so Kip can offer another way in. */
export const WrongContext = createContext<() => void>(() => {});
export const useReportWrong = () => useContext(WrongContext);
