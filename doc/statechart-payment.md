```mermaid

stateDiagram
    state CreatingOrder <<fork>>
    
    [*] --> CreatingOrder: createOrder()
    
    CreatingOrder --> Failure
    CreatingOrder --> Success: payWithWallet()
    CreatingOrder --> ProcessingPayrexxPayment: payWithPayrexx()

    ProcessingPayrexxPayment --> Success
    ProcessingPayrexxPayment --> Failure
    
    Failure --> [*]
    Success --> [*]
```