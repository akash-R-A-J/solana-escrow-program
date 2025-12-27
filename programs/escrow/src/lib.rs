pub mod instructions;
pub mod state;
pub mod error;
pub mod constants;

use anchor_lang::prelude::*;
use instructions::*;


declare_id!("6kTpPk3Bm4SfY2KuLF5sH4cpsTwBUtyJ5j3prMB92i7Q");

#[program]
pub mod escrow{
    use super::*;

    pub fn make_offer(
        context: Context<MakeOffer>,
        id: u64,
        token_a_offered_amount: u64,
        token_b_demanded_amount: u64
    )->Result<()>{
        make_offer::make_offer(context, id, token_a_offered_amount, token_b_demanded_amount)
    }

    pub fn take_offer(
        context: Context<TakeOffer>
    )->Result<()>{
       take_offer::take_offer(context)
    }

    pub fn revoke_offer(
        context: Context<RevokeOffer>
    )->Result<()>{
        revoke_offer::revoke_offer(context)
    }
}


