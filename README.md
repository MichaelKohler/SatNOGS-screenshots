# SatNogs Screenshots

Azure Function to create screenshots of SatNogs station details.

## Deployment

Make sure you create the appropriate function in the Azure Portal (or through the CLI, or VS Code).

```bash
func azure functionapp publish satnogs-screenshots --build remote --node
```
