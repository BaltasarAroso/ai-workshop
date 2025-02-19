# Step 0

## Objective

In this step, you will load user data and a prompt template from files.

## Instructions

1. Create a file `data/twitter_users.txt` and write a list of Twitter/X usernames (one per line).
2. Create a file `data/prompt_template.txt` and write your prompt template.
3. Implement the `loadUsers` method in `step1.ts` to:
   - Read the `data/twitter_users.txt` file using `fs.readFileSync`
   - Split the content by newlines to get an array of usernames
   - Filter out any empty lines
   - Return the array of usernames
4. Implement the `loadPromptTemplate` method in `step1.ts` to:
   - Read the `data/prompt_template.txt` file using `fs.readFileSync`
   - Return the content as a string

## Example File Contents

`data/twitter_users.txt`:
```
elonmusk
BarackObama
BillGates
```

`data/prompt_template.txt`:
```
Please analyze the following tweets from {username}:

{tweets}

Provide a brief summary of the main topics and themes discussed.
```

## Tips

- Use `fs.readFileSync` with UTF-8 encoding to read the files:
```typescript
const content = fs.readFileSync('path/to/file', 'utf-8')
```
- To split a string by newlines and remove empty lines:
```typescript
const lines = content.split('\n').filter(line => line.trim() !== '')
```