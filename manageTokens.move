module 0x1::manageTokens {
    use 0x1::aptos_coin;
    use 0x1::coin;
    use 0x1::account;
    use 0x1::signer;

    struct TokenManager has key {
        total_supply: u64,
    }

    // Function to create a token manager for a specific account
    public fun create_token_manager(account: &signer) {
        let token_manager = TokenManager { total_supply: 0 };
        move_to(signer::address_of(account), token_manager);
    }

    // Function to mint tokens for a specific account
    public fun mint_tokens(account_address: address, amount: u64) {
        assert!(account::exists<coin::CoinStore<0x1::aptos_coin::AptosCoin>>(account_address), 0);
        let coin_store = borrow_global_mut<coin::CoinStore<0x1::aptos_coin::AptosCoin>>(account_address);
        coin::mint(coin_store, amount);
        
        // Update the total supply in the token manager
        let manager = borrow_global_mut<TokenManager>(account_address);
        manager.total_supply = manager.total_supply + amount;
    }

    // Function to burn tokens for a specific account
    public fun burn_tokens(account_address: address, amount: u64) {
        assert!(account::exists<coin::CoinStore<0x1::aptos_coin::AptosCoin>>(account_address), 0);
        let coin_store = borrow_global_mut<coin::CoinStore<0x1::aptos_coin::AptosCoin>>(account_address);
        coin::burn(coin_store, amount);
        
        // Update the total supply in the token manager
        let manager = borrow_global_mut<TokenManager>(account_address);
        
        // Ensure no underflow before subtracting from total_supply
        assert!(manager.total_supply >= amount, 2); // Ensure no underflow
        manager.total_supply = manager.total_supply - amount; // Perform the subtraction
    }

    // Function to burn an object of type T
    public fun burn_object<T>(owner: &signer, object_value: u64) {
        // Ensure the owner is the correct signer
        let owner_address = signer::address_of(owner);
        
        // Ensure that the owner has a token manager
        assert!(exists<TokenManager>(owner_address), 1);
        
        // Update TokenManager's total supply
        let manager = borrow_global_mut<TokenManager>(owner_address);
        assert!(manager.total_supply >= object_value, 2); // Ensure no underflow
        manager.total_supply = manager.total_supply - object_value;
        
        // Emit burn event (if you have an event function)
        // emit_burn_event(owner_address, object_value);
    }
}