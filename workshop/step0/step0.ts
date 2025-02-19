import fs from 'fs'

class TwitterDigestAgent {
  constructor() {}

  /* --------------------- 1. User Input - Load from file --------------------- */
  private loadUsers(): string[] {
    //  Add code here
    return []
  }

  private loadPromptTemplate(): string {
    //  Add code here
    return ''
  }

  /* ------------------------------ Main Function ----------------------------- */
  public async run(): Promise<void> {
    const users = this.loadUsers()
    const promptTemplate = this.loadPromptTemplate()
    if (users.length === 0 || promptTemplate === '') {
      console.log('❌ No users or prompt template')
    } else {
      console.log('✅ Users:', users)
      console.log('✅ Prompt Template:', promptTemplate)
    }
  }
}

export default TwitterDigestAgent
