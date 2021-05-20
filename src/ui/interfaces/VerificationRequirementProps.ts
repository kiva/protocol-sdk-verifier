export interface VerificationRequirementProps {
  integrationName: string,
  setProfile: Function
}

export interface VerificationRequirementState {
  verificationRequired: number,
  proofOptions: any[]
} 

export interface ProofRequestProfile {
  comment: string,
  proof_request: object,
  schema_id: string
}