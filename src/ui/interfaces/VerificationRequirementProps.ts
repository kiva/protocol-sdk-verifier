export interface VerificationRequirementProps {
  integrationName: string,
  setProfile: Function
}

export interface VerificationRequirementState {
  verificationRequired: number,
  proofOptions: any[],
  proofsLoading: boolean,
  proofOptionsError: string
} 

export interface ProofRequestProfile {
  comment: string,
  proof_request: object,
  schema_id: string
}