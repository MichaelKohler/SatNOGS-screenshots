# SatNogs Screenshots

Azure Function to create screenshots of SatNogs station details.

## Deployment

Make sure you create the appropriate function in the Azure Portal (or through the CLI, or VS Code). Also install the Azure Functions Core Tools. Then deploying this function becomes a one-liner:

```bash
func azure functionapp publish satnogs-screenshots --build remote --node
```

To secure the invocation, you can add a "Function Key". If a function key is provided, you will need to pass it as query param: `&code=CODE`.
