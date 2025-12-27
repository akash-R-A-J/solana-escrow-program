use anchor_lang::prelude::*;
use crate::state::Offer;
use crate::constants::OFFER_SEED;
use crate::error::EscrowError;
use super::shared::{close_token_account, transfer_tokens};
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface}
};


#[derive(Accounts)]
pub struct TakeOffer<'info>{
    pub token_program: Interface<'info, TokenInterface>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,

    #[account(mut)]
    pub offer_taker: Signer<'info>,

    #[account(mut)]
    pub offer_maker: SystemAccount<'info>,

    pub token_mint_a: InterfaceAccount<'info, Mint>,

    pub token_mint_b: InterfaceAccount<'info, Mint>,

    
    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = offer,
        associated_token::token_program = token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = offer_taker,
        associated_token::mint = token_mint_a,
        associated_token::authority = offer_taker,
        associated_token::token_program = token_program
    )]
    pub offer_taker_token_account_a: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_mint_b,
        associated_token::authority = offer_taker,
        associated_token::token_program = token_program
    )]
    pub offer_taker_token_account_b: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = offer_taker,
        associated_token::mint = token_mint_b,
        associated_token::authority = offer_maker,
        associated_token::token_program = token_program
    )]
    pub offer_maker_token_account_b: InterfaceAccount<'info, TokenAccount>,
    
    #[account(
        mut,
        close = offer_maker,
        has_one = offer_maker,
        has_one = token_mint_b,
        seeds = [OFFER_SEED, offer.id.to_le_bytes().as_ref()],
        bump = offer.bump
    )]
    pub offer: Account<'info, Offer>
}

pub fn take_offer(
context: Context<TakeOffer>
)->Result<()>{
    let offer_account_seeds: &[&[u8]] = &[
        OFFER_SEED,
        &context.accounts.offer.id.to_le_bytes()[..],
        &[context.accounts.offer.bump]
    ];

    let signer_seeds = Some(offer_account_seeds);

    transfer_tokens(
        &context.accounts.vault,
        &context.accounts.offer_taker_token_account_a,
        &context.accounts.vault.amount,
        &context.accounts.token_mint_a,
        &context.accounts.offer.to_account_info(),
        &context.accounts.token_program,
        signer_seeds,
    ).map_err(|_| EscrowError::FailedVaultWithdrawal)?;

     close_token_account(
        &context.accounts.vault,
        &context.accounts.offer_maker.to_account_info(),
        &context.accounts.offer.to_account_info(),
        &context.accounts.token_program,
        signer_seeds,
    ).map_err(|_| EscrowError::FailedVaultClosure)?;

     transfer_tokens(
        &context.accounts.offer_taker_token_account_b,
        &context.accounts.offer_maker_token_account_b,
        &context.accounts.offer.token_b_demanded_amount,
        &context.accounts.token_mint_b,
        &context.accounts.offer_taker.to_account_info(),
        &context.accounts.token_program,
        None,
    ).map_err(|_| EscrowError::InsufficentOfferTakerBalance)?;

    Ok(())
}