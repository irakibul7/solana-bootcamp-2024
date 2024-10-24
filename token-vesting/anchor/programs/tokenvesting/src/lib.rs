#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod tokenvesting {
    use super::*;

    pub fn create_vesting_account(ctx: Context<CreateVestingAccount>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]

pub struct CreateVestingAccount<'info> {}
