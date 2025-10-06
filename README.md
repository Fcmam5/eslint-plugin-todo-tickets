# eslint-plugin-todo-tickets

ESLint plugin to enforce TODO comments with ticket numbers (JIRA, GitHub issues, etc.)

> [!NOTE] Disclaimer 1:
> This plugin was initially vibe-coded in a rush, but I promise, I reviewed the code and tested it.

> [!TIP] Disclaimer 2:
> Before I push this mess I found similar projects:
> - [eslint-plugin-todo-plz](https://github.com/sawyerh/eslint-plugin-todo-plz)
> - [eslint-plugin-jira-ticket-todos](https://www.npmjs.com/package/eslint-plugin-jira-ticket-todos)
>
> I should've googled things before, but yeah, here am I, procrastinating and re-inventing the wheel.



## Installation

```bash
npm install --save-dev eslint-plugin-todo-tickets
```

## Usage

Add `todo-tickets` to the plugins section of your `.eslintrc` configuration file:

```json
{
  "plugins": ["todo-tickets"],
  "rules": {
    "todo-tickets/todo-tickets": "error"
  }
}
```

## Configuration

You can customize the ticket patterns and keywords:

```json
{
  "rules": {
    "todo-tickets/todo-tickets": ["error", {
      "ticketPatterns": [
        "[A-Z]{2,}-\\d+",  // JIRA format (e.g., ABC-123)
        "#\\d+"           // GitHub format (e.g., #42)
      ],
      "keywords": ["TODO", "FIXME", "BUG", "HACK"]
    }]
  }
}
```

## Examples

### Valid

```javascript
// TODO ABC-123: Fix this issue
// FIXME #42: Something to fix
/* BUG ASMO-42: Important bug */
// HACK MCO-123: Temporary solution
```

### Invalid

```javascript
// TODO: Missing ticket
// FIXME: No ticket here
// TODO INVALID-TICKET: Invalid format
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.