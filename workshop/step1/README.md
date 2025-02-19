# Step 1

## Objective

In this step, you will load user data and a prompt template from files.

## Instructions

1. Open the `step1.ts` file.
2. Implement the `loadUsers` method to load users from the `data/twitter_users.txt` file.
3. Implement the `loadPromptTemplate` method to load the prompt template from the `data/prompt_template.txt` file.

## Example

```typescript
const step1 = new Step1()
const users = step1.loadUsers()
console.log(users) // Output: Array of users

const promptTemplate = step1.loadPromptTemplate()
console.log(promptTemplate) // Output: Prompt template string
```
