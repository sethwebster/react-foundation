#!/usr/bin/env tsx
/**
 * Chatbot Content Diagnostic Tool
 *
 * Verifies:
 * 1. Vector store has content
 * 2. Search queries work correctly
 * 3. Specific pages/topics are discoverable
 */

import Redis from 'ioredis';
import { getCurrentIndexName, searchSimilar } from '../src/lib/chatbot/vector-store';
import { createEmbedding } from '../src/lib/chatbot/openai';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

interface DiagnosticResult {
  pass: boolean;
  message: string;
  details?: unknown;
}

async function diagnose(): Promise<void> {
  console.log('🔍 Chatbot Content Diagnostic Tool\n');
  console.log(`Connecting to Redis: ${REDIS_URL}\n`);

  const redis = new Redis(REDIS_URL);
  const results: DiagnosticResult[] = [];

  try {
    // Test 1: Check if vector index exists
    console.log('Test 1: Vector Index Exists');
    try {
      const currentIndex = await getCurrentIndexName(redis);
      if (currentIndex) {
        results.push({
          pass: true,
          message: '✅ Vector index found',
          details: { indexName: currentIndex },
        });
        console.log(`✅ Vector index found: ${currentIndex}\n`);
      } else {
        results.push({
          pass: false,
          message: '❌ No vector index found - content not ingested',
        });
        console.log('❌ No vector index found - content has not been ingested\n');
      }
    } catch (error) {
      results.push({
        pass: false,
        message: '❌ Error checking vector index',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
      console.log(`❌ Error checking vector index: ${error}\n`);
    }

    // Test 2: Count total chunks
    console.log('Test 2: Content Chunk Count');
    try {
      const currentIndex = await getCurrentIndexName(redis);
      if (currentIndex) {
        // Get all keys with the index prefix
        const indexPrefix = `chatbot:chunks:${currentIndex}:`;
        const keys = await redis.keys(`${indexPrefix}*`);
        const chunkCount = keys.length;

        if (chunkCount > 0) {
          results.push({
            pass: true,
            message: '✅ Content chunks found',
            details: { chunkCount },
          });
          console.log(`✅ Found ${chunkCount} content chunks\n`);
        } else {
          results.push({
            pass: false,
            message: '❌ No content chunks found - empty index',
          });
          console.log('❌ No content chunks found - index is empty\n');
        }
      }
    } catch (error) {
      results.push({
        pass: false,
        message: '❌ Error counting chunks',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
      console.log(`❌ Error counting chunks: ${error}\n`);
    }

    // Test 3: Search for community guide
    console.log('Test 3: Search for "guide for starting a community"');
    try {
      const query = 'Do you have a guide for starting a community?';
      const queryEmbedding = await createEmbedding(query);
      const communityResults = await searchSimilar(redis, queryEmbedding, { k: 5 });

      if (communityResults.length > 0) {
        results.push({
          pass: true,
          message: '✅ Community guide content found',
          details: {
            resultCount: communityResults.length,
            topResults: communityResults.map(r => ({
              id: r.id,
              source: r.source,
              score: r.score,
              contentPreview: r.content.substring(0, 100) + '...',
            })),
          },
        });
        console.log(`✅ Found ${communityResults.length} results for community guide:`);
        communityResults.forEach((result, i) => {
          console.log(`\n  Result ${i + 1}:`);
          console.log(`  - ID: ${result.id}`);
          console.log(`  - Source: ${result.source}`);
          console.log(`  - Score: ${result.score}`);
          console.log(`  - Preview: ${result.content.substring(0, 150)}...`);
        });
        console.log();
      } else {
        results.push({
          pass: false,
          message: '❌ No results for community guide query',
        });
        console.log('❌ No results found for community guide query\n');
      }
    } catch (error) {
      results.push({
        pass: false,
        message: '❌ Error searching for community guide',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
      console.log(`❌ Error searching: ${error}\n`);
    }

    // Test 4: Search for "How do I start a community"
    console.log('Test 4: Search for "How do I start a community"');
    try {
      const query2 = 'How do I start a community';
      const queryEmbedding2 = await createEmbedding(query2);
      const startResults = await searchSimilar(redis, queryEmbedding2, { k: 5 });

      if (startResults.length > 0) {
        results.push({
          pass: true,
          message: '✅ "Start community" query works',
          details: {
            resultCount: startResults.length,
            sources: startResults.map(r => r.source),
          },
        });
        console.log(`✅ Found ${startResults.length} results:`);
        startResults.forEach((result, i) => {
          console.log(`  ${i + 1}. ${result.source} (score: ${result.score})`);
        });
        console.log();
      } else {
        results.push({
          pass: false,
          message: '❌ No results for "start community" query',
        });
        console.log('❌ No results found\n');
      }
    } catch (error) {
      results.push({
        pass: false,
        message: '❌ Error searching',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
      console.log(`❌ Error searching: ${error}\n`);
    }

    // Test 5: Check for /communities/start page reference
    console.log('Test 5: Check for /communities/start page in content');
    try {
      const currentIndex = await getCurrentIndexName(redis);
      if (currentIndex) {
        const indexPrefix = `chatbot:chunks:${currentIndex}:`;
        const keys = await redis.keys(`${indexPrefix}*`);

        let foundStartPage = false;
        for (const key of keys) {
          const chunk = await redis.hgetall(key);
          if (chunk.source && chunk.source.includes('/communities/start')) {
            foundStartPage = true;
            results.push({
              pass: true,
              message: '✅ /communities/start page found in content',
              details: {
                source: chunk.source,
                id: chunk.id,
              },
            });
            console.log(`✅ Found /communities/start page reference:`);
            console.log(`  - Source: ${chunk.source}`);
            console.log(`  - ID: ${chunk.id}\n`);
            break;
          }
        }

        if (!foundStartPage) {
          results.push({
            pass: false,
            message: '⚠️  /communities/start page NOT found in content',
            details: 'This page is not being crawled in production. Only public-context/ files are ingested.',
          });
          console.log('⚠️  /communities/start page NOT found in vector store');
          console.log('    Reason: Website crawling is disabled in production');
          console.log('    Only public-context/ markdown files are ingested\n');
        }
      }
    } catch (error) {
      results.push({
        pass: false,
        message: '❌ Error checking for page reference',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
      console.log(`❌ Error checking: ${error}\n`);
    }

    // Summary
    console.log('=' .repeat(60));
    console.log('SUMMARY\n');
    const passCount = results.filter(r => r.pass).length;
    const totalTests = results.length;
    console.log(`Tests passed: ${passCount}/${totalTests}\n`);

    if (passCount === totalTests) {
      console.log('🎉 All tests passed! Chatbot content is working correctly.\n');
    } else {
      console.log('⚠️  Some tests failed. See details above.\n');
      console.log('RECOMMENDATIONS:\n');

      const hasIndex = results.find(r => r.message.includes('Vector index found'));
      const hasChunks = results.find(r => r.message.includes('Content chunks found'));
      const hasStartPage = results.find(r => r.message.includes('/communities/start page found'));

      if (!hasIndex || !hasChunks) {
        console.log('1. Run ingestion to populate content:');
        console.log('   - Visit /admin/data in your browser');
        console.log('   - Click "Run Ingestion"');
        console.log('   - Wait for completion\n');
      }

      if (!hasStartPage || !hasStartPage.pass) {
        console.log('2. Add reference to /communities/start in public-context:');
        console.log('   - Edit public-context/getting-involved/community-building-guide.md');
        console.log('   - Add line at top: "📚 Full guide: https://react.foundation/communities/start"');
        console.log('   - This helps chatbot direct users to the page\n');
      }

      console.log('3. Verify search results match user queries:');
      console.log('   - Test common questions in the chatbot');
      console.log('   - Check if results are relevant');
      console.log('   - Adjust public-context content if needed\n');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await redis.quit();
  }
}

diagnose();
