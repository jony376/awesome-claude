/**
 * Registry trust drilldown helpers extracted into a pure library module.
 *
 * The deterministic trust-reason and install-risk layer lives in
 * `@/lib/trust-lib` and is re-exported below so the public
 * `@/lib/trust` surface is unchanged for routes and components.
 */
export {
  getTrustReasons,
  installRiskLevel,
  INSTALL_RISK_DETAIL,
  INSTALL_RISK_LABEL,
  summarizeTrust,
  type InstallRisk,
  type TrustReason,
  type TrustSeverity,
} from "@/lib/trust-lib";
