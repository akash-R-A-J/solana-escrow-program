use super::shared::transfer_tokens;
use crate::error::EscrowError;
use crate::constants::OFFER_SEED;
use crate::state::Offer;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface}
};


#[derive(Accounts)]
#[instruction(id:u64)]
pub struct MakeOffer<'info>{
    pub system_program: Program<'info, System>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub token_program: Interface<'info, TokenInterface>,

    #[account(mint::token_program = token_program)]
    pub token_mint_a: InterfaceAccount<'info, Mint>,

    #[account(mint::token_program = token_program)]
    pub token_mint_b: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub offer_maker: Signer<'info>,
    
    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = offer_maker,
        associated_token::token_program = token_program
    )]
    pub offer_maker_token_account_a: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init,
        payer=offer_maker,
        space=8+Offer::INIT_SPACE,
        seeds=[OFFER_SEED, id.to_le_bytes().as_ref()],
        bump
    )]
    pub offer: Account<'info, Offer>,

    #[account(
        init,
        payer=offer_maker,
        associated_token::mint=token_mint_a,
        associated_token::authority=offer,
        associated_token::token_program=token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
}


pub fn make_offer(
    context: Context<MakeOffer>,
    id: u64,
    token_a_offered_amount: u64,
    token_b_demanded_amount: u64

)->Result<()>{
    require!(token_a_offered_amount>0 && token_b_demanded_amount>0, EscrowError::InvalidAmount);

    require!(context.accounts.token_mint_a.key() != context.accounts.token_mint_b.key(), EscrowError::InvalidTokenMint);

    transfer_tokens(
        &context.accounts.offer_maker_token_account_a,
        &context.accounts.vault,
        &token_a_offered_amount,
        &context.accounts.token_mint_a,
        &context.accounts.offer_maker.to_account_info(),
        &context.accounts.token_program,
        None,
    ).map_err(|_| EscrowError::InsufficentOfferMakerBalance)?;

    context.accounts.offer.set_inner(Offer{
        id,
        offer_maker: context.accounts.offer_maker.key(),
        token_mint_a: context.accounts.token_mint_a.key(),
        token_mint_b: context.accounts.token_mint_b.key(),
        token_b_demanded_amount,
        bump: context.bumps.offer,
    });

    Ok(())
}
