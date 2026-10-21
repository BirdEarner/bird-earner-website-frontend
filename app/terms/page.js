import { LegalDocument } from "@/components/legal-document";
import { TERMS_AND_CONDITIONS_CONTENT } from "@/lib/legal-content";

export const metadata = {
  title: "Terms and Conditions | BirdEarner",
  description:
    "Terms and Conditions for BirdEarner by BCF BirdEarner Solutions (OPC) Pvt Ltd.",
};

export default function TermsAndConditionsPage() {
  return (
    <LegalDocument
      title="Terms and Conditions"
      blocks={TERMS_AND_CONDITIONS_CONTENT}
    />
  );
}
