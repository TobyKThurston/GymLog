// src/types/custom.d.ts

// react-chartjs-2 doesn’t ship its own types in some setups, declare it so TS stops complaining
declare module "react-chartjs-2";

// fallback declarations for the implicit libraries throwing missing-definition errors
declare module "d3-color";
declare module "d3-ease";
declare module "d3-path";
declare module "d3-scale";
declare module "d3-time";
declare module "d3-timer";

declare module "estree";
declare module "json-schema";
