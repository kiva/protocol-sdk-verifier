import ICommonProps from './ICommonProps';

export interface VerificationRequirementProps extends ICommonProps {}

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