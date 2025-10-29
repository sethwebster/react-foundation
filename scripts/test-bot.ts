/**
 * Test script for GitHub bot
 *
 * Usage: npx tsx scripts/test-bot.ts
 * Note: tsx automatically loads .env files
 */

import { Octokit } from '@octokit/rest';

async function testBot() {
  console.log('🤖 Testing GitHub Bot Configuration...\n');

  // Check if bot is configured
  const botToken = process.env.GITHUB_BOT_TOKEN;

  if (!botToken) {
    console.error('❌ Bot is not configured!');
    console.error('   Please set GITHUB_BOT_TOKEN in your .env file');
    console.error('\n   Steps:');
    console.error('   1. Open .env file');
    console.error('   2. Add: GITHUB_BOT_TOKEN=ghp_your_token_here');
    console.error('   3. Save and run this script again\n');
    process.exit(1);
  }

  console.log('✅ Bot token is configured\n');

  // Get bot info
  try {
    console.log('📡 Fetching bot account info...\n');

    const octokit = new Octokit({ auth: botToken });
    const response = await octokit.rest.users.getAuthenticated();
    const botInfo = response.data;

    console.log('✅ Successfully connected to GitHub!\n');
    console.log('Bot Account Details:');
    console.log('─────────────────────────────────────');
    console.log(`Username:  ${botInfo.login}`);
    console.log(`Name:      ${botInfo.name || '(not set)'}`);
    console.log(`Profile:   ${botInfo.html_url}`);
    console.log(`Avatar:    ${botInfo.avatar_url}`);
    console.log('─────────────────────────────────────\n');

    console.log('🎉 Bot is ready to use!');
    console.log('\nNext steps:');
    console.log('1. The bot can now file issues on behalf of users');
    console.log('2. Users only need read:user OAuth scope');
    console.log('3. Use the useGitHubBot() hook in your components');
    console.log('4. See docs/development/github-bot-setup.md for usage examples\n');
  } catch (error) {
    console.error('❌ Failed to connect to GitHub');

    if (error && typeof error === 'object' && 'status' in error) {
      const githubError = error as { status: number; message?: string };

      if (githubError.status === 401) {
        console.error('\n   The token is invalid or expired');
        console.error('   Please regenerate the token and update .env');
        console.error('\n   Steps:');
        console.error('   1. Sign in as the bot account');
        console.error('   2. Go to https://github.com/settings/tokens/new');
        console.error('   3. Generate new token with public_repo scope');
        console.error('   4. Update GITHUB_BOT_TOKEN in .env\n');
      } else if (githubError.status === 403) {
        console.error('\n   The token does not have the required permissions');
        console.error('   Make sure the token has public_repo scope');
        console.error('\n   Steps:');
        console.error('   1. Sign in as the bot account');
        console.error('   2. Go to https://github.com/settings/tokens');
        console.error('   3. Regenerate the token with public_repo scope checked\n');
      } else {
        console.error(`\n   GitHub API error: ${githubError.status}`);
        console.error(`   Message: ${githubError.message || 'Unknown error'}\n`);
      }
    } else {
      console.error(`\n   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    process.exit(1);
  }
}

testBot();
