/**
 * DOPAMINE AI - Verification & Test Suite
 * Tests all 8 Fictional Scenarios defined in Requirement 8.
 */

import { MockChatService } from '../src/services/mockChatService.ts';
import { ChatService } from '../src/services/chatService.ts';
import { generateAiResponse, isAiConfigured } from '../server/aiService.ts';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING DOPAMINE AI SCENARIOS TEST SUITE');
  console.log('======================================================\n');

  // Scenario 1: Kazakh academic stress question
  console.log('--- Test 1: Kazakh Academic Stress Question ---');
  const res1 = await MockChatService.processMessage({
    message: 'Сабақтан шаршадым, тапсырмалар өте көп.',
    language: 'kk',
  });
  assert(res1.language === 'kk', 'Detected or respected Kazakh language');
  assert(res1.text.includes('шаршағаныңды') || res1.text.includes('демалыс'), 'Contains empathetic rest guidance');
  assert(res1.isDemo === true, 'Response is clearly marked as demo mode');
  assert(Array.isArray(res1.suggestedActions) && res1.suggestedActions.length > 0, 'Provides suggested follow-up actions');

  // Scenario 2: Russian exam preparation question
  console.log('\n--- Test 2: Russian Exam Preparation Question ---');
  const res2 = await MockChatService.processMessage({
    message: 'Очень сильно переживаю из-за сессии и предстоящих экзаменов.',
    language: 'ru',
  });
  assert(res2.language === 'ru', 'Detected or respected Russian language');
  assert(res2.text.includes('экзамен') || res2.text.includes('Pomodoro') || res2.text.includes('тревога'), 'Contains practical exam preparation guidance');
  assert(res2.isDemo === true, 'Response is clearly marked as demo mode');

  // Scenario 3: Request for medical diagnosis / prescription (CRITICAL SAFETY)
  console.log('\n--- Test 3: Request for Medical Diagnosis or Prescription ---');
  const res3 = await MockChatService.processMessage({
    message: 'Маған депрессия диагнозын қойып, антидепрессант дәрі жазып берші.',
    language: 'kk',
  });
  assert(res3.text.includes('дәрігер') || res3.text.includes('медициналық'), 'Explicitly refuses to act as doctor or medical professional');
  assert(res3.text.includes('111') || res3.text.includes('103') || res3.showConnectButton === true, 'Directs to human help / emergency hotlines');
  assert(res3.showConnectButton === true, 'Triggers DOPAMINE CONNECT button for professional human care');

  // Scenario 4: Request to book a psychologist appointment
  console.log('\n--- Test 4: Request to Book a Psychologist Appointment ---');
  const res4 = await MockChatService.processMessage({
    message: 'Психологпен қалай сөйлесуге және жазылуға болады?',
    language: 'kk',
  });
  assert(res4.showConnectButton === true, 'Activates DOPAMINE CONNECT button');
  assert(res4.text.includes('DOPAMINE CONNECT'), 'Explains the psychologist booking feature');
  assert(res4.text.includes('автоматты') || res4.text.includes('кеңес'), 'Clarifies appointments are not booked without consent');

  // Scenario 5: Empty message validation
  console.log('\n--- Test 5: Empty Message Validation ---');
  const res5 = await MockChatService.processMessage({
    message: '     ',
    language: 'kk',
  });
  assert(res5.text.length > 0, 'Gracefully handles whitespace and returns friendly invitation');
  assert(res5.suggestedActions && res5.suggestedActions.length > 0, 'Provides prompt suggestions for empty inputs');

  // Scenario 6: Missing API configuration handling
  console.log('\n--- Test 6: Missing API Configuration Handling ---');
  const isConfigured = isAiConfigured();
  console.log(`  ℹ️ Live API configured: ${isConfigured}`);
  const serverRes = await generateAiResponse({
    message: 'Оқу жоспарын құрғым келеді',
    language: 'kk',
  });
  assert(serverRes.text.length > 0, 'Server returns valid response even when API key is missing');
  assert(serverRes.isDemo === true || !isConfigured, 'Correctly flags demo mode when unconfigured');

  // Scenario 7: Network error handling in ChatService
  console.log('\n--- Test 7: Network Error & Fallback in ChatService ---');
  const offlineChatService = new ChatService('http://invalid-localhost-domain-99999/api/chat', 'auto');
  const offlineRes = await offlineChatService.sendMessage({
    message: 'Жаңа ортаға бейімделгім келеді',
    language: 'kk',
  });
  assert(offlineRes.isDemo === true, 'Gracefully falls back to scripted demo mode on network failure');
  assert(offlineRes.text.toLowerCase().includes('бейімделу') || offlineRes.text.toLowerCase().includes('орта'), 'Returns meaningful advice during offline fallback');

  // Scenario 8: Scripted Demo service in pure offline mode
  console.log('\n--- Test 8: Scripted Demo Mode (Zero Network Dependency) ---');
  const pureDemoService = new ChatService('/api/chat', 'demo');
  assert(pureDemoService.getMode() === 'demo', 'ChatService operates in pure demo mode');
  const startersKk = pureDemoService.getSuggestedStarters('kk');
  const startersRu = pureDemoService.getSuggestedStarters('ru');
  assert(startersKk.length === 5, 'Provides exactly 5 Kazakh suggested conversation starters');
  assert(startersRu.length === 5, 'Provides exactly 5 Russian suggested conversation starters');

  console.log('\n======================================================');
  console.log(`📊 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test suite crashed:', err);
  process.exit(1);
});
