```mermaid

stateDiagram
    [*] --> SelectMember
    
    SelectMember --> SelectPaymentMethod
    SelectMember --> [*]: cancel

    SelectPaymentMethod --> TopUpWallet
    SelectPaymentMethod --> ProcessingWalletPayment
    SelectPaymentMethod --> ProcessingPayrexxPayment
    SelectPaymentMethod --> [*]: cancel

    ProcessingWalletPayment --> Success
    ProcessingWalletPayment --> Failure

    ProcessingPayrexxPayment --> Success
    ProcessingPayrexxPayment --> Failure

    TopUpWallet --> ProcessingWalletPayment
    TopUpWallet --> Failure
    TopUpWallet --> [*]: cancel
    
    Failure --> [*]
    Success --> [*]
```