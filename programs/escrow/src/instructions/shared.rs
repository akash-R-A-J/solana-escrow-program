use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    close_account, transfer_checked, CloseAccount, Mint, TokenAccount, TokenInterface,
    TransferChecked,
};

pub fn transfer_tokens<'info>(
    from: &InterfaceAccount<'info, TokenAccount>,
    to: &InterfaceAccount<'info, TokenAccount>,
    amount: &u64,
    mint: &InterfaceAccount<'info, Mint>,
    authority: &AccountInfo<'info>,
    token_program: &Interface<'info, TokenInterface>,
    owning_pda_seeds: Option<&[&[u8]]>,
)->Result<()>{
    let transfer_accounts = TransferChecked {
        from: from.to_account_info(),
        mint: mint.to_account_info(),
        to: to.to_account_info(),
        authority: authority.to_account_info(),
    };

    let signers_seeds = owning_pda_seeds.map(|seeds| [seeds]);

    transfer_checked(
        if let Some(seeds_arr) = signers_seeds.as_ref() {
            CpiContext::new_with_signer(
                token_program.to_account_info(),
                transfer_accounts,
                seeds_arr,
            )
        } else {
            CpiContext::new(token_program.to_account_info(), transfer_accounts)
        },
        *amount,
        mint.decimals,
    )
}

pub fn close_token_account<'info>(
    token_account: &InterfaceAccount<'info, TokenAccount>,
    destination: &AccountInfo<'info>,
    authority: &AccountInfo<'info>,
    token_program: &Interface<'info, TokenInterface>,
    owning_pda_seeds: Option<&[&[u8]]>,
)->Result<()>{
    let close_accounts = CloseAccount {
        account: token_account.to_account_info(),
        destination: destination.to_account_info(),
        authority: authority.to_account_info(),
    };

    let signers_seeds = owning_pda_seeds.map(|seeds| [seeds]);

    close_account(if let Some(seeds_arr) = signers_seeds.as_ref() {
        CpiContext::new_with_signer(token_program.to_account_info(), close_accounts, seeds_arr)
    } else {
        CpiContext::new(token_program.to_account_info(), close_accounts)
    })
}