use anchor_lang::prelude::*;

#[error_code]
pub enum EscrowError{
    #[msg("Insufficent token balance in offer maker's account")]
    InsufficentOfferMakerBalance,

    #[msg("Insufficient token balance in offer taker's account")]
    InsufficentOfferTakerBalance,

    #[msg("Demanded token must be different from offered token")]
    InvalidTokenMint,

    #[msg("Amount must be greater than zero")]
    InvalidAmount,

    #[msg("Failed to withdraw tokens from vault")]
    FailedVaultWithdrawal,

    #[msg("Failed to close vault account")]
    FailedVaultClosure,

    #[msg("Failed to refund tokens from vault")]
    FailedRefund,
}
