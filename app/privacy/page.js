import { LegalDocument } from "@/components/legal-document";
import { PRIVACY_POLICY_CONTENT } from "@/lib/legal-content";

export const metadata = {
  title: "Privacy Policy | BirdEarner",
  description:
    "Privacy Policy for BirdEarner by BCF BirdEarner Solutions (OPC) Pvt Ltd.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument title="Privacy Policy" blocks={PRIVACY_POLICY_CONTENT} />
  );
}
