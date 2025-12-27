use anchor_lang::prelude::*;
use crate::state::Offer;
use crate::constants::OFFER_SEED;
use crate::error::EscrowError;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use super::shared::{transfer_tokens, close_token_account};

#[derive(Accounts)]
pub struct RevokeOffer<'info>{
    pub token_program: Interface<'info, TokenInterface>,

    pub system_program: Program<'info, System>,

    #[account(mut)]
    pub offer_maker: Signer<'info>,

    pub token_mint_a: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::token_program = token_program,
        associated_token::authority = offer_maker
    )]
    pub offer_maker_token_account_a: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        close = offer_maker,
        has_one = offer_maker,
        has_one = token_mint_a,
        seeds = [OFFER_SEED, offer.id.to_le_bytes().as_ref()],
        bump = offer.bump
    )]
    pub offer: Account<'info, Offer>,

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::token_program = token_program,
        associated_token::authority = offer
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>   
   
}


pub fn revoke_offer<'info>(
    context: Context<RevokeOffer>
)->Result<()>{
    let offer = &context.accounts.offer;
    let offer_account_seeds: &[&[u8]] = &[
        OFFER_SEED,
        &offer.id.to_le_bytes()[..],
        &[offer.bump]
    ];

    let signer_seeds = Some(offer_account_seeds);

    transfer_tokens(
        &context.accounts.vault,
        &context.accounts.offer_maker_token_account_a,
        &context.accounts.vault.amount,
        &context.accounts.token_mint_a,
        &context.accounts.offer.to_account_info(),
        &context.accounts.token_program,
        signer_seeds,
    ).map_err(|_| EscrowError::FailedRefund)?;

    close_token_account(
        &context.accounts.vault,
        &context.accounts.offer_maker.to_account_info(),
        &context.accounts.offer.to_account_info(),
        &context.accounts.token_program,
        signer_seeds,
    ).map_err(|_| EscrowError::FailedVaultClosure)?;

    Ok(())
}