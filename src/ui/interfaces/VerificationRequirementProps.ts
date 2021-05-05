export interface VerificationRequirementProps {
  integrationName: string,
  setProfile: Function
}

export interface VerificationRequirementState {
  verificationRequired: number,
  proofOptions: any[]
} 