"use client";

import { Crisp } from "crisp-sdk-web";
import { useEffect } from "react";

import { env } from "@/env";

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure(env.NEXT_PUBLIC_CRISP_WEBSITE_ID);
  }, []);

  return null;
};
