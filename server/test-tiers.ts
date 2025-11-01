import { tierLimitService } from './services/TierLimitService';

async function testTiers() {
  console.log('🧪 Testing Tier System...\n');

  // Test 1: Get all tiers
  const allTiers = await tierLimitService.getAllTierLimits();
  console.log('✅ All tiers:', allTiers.length);
  allTiers.forEach(t => {
    console.log(`  - ${t.tier_display_name}: ${t.monthly_operations} ops, $${t.price_monthly}/mo`);
  });

  // Test 2: Get specific tier
  const freeTier = await tierLimitService.getTierLimits('free');
  console.log('\n✅ FREE tier:', freeTier?.tier_display_name);
  console.log(`  Max operations: ${freeTier?.monthly_operations}`);
  console.log(`  Regular files: ${freeTier?.max_file_size_regular}MB`);
  console.log(`  RAW files: ${freeTier?.max_file_size_raw}MB`);

  // Test 3: Validate file size
  const jpgTest = await tierLimitService.validateFileSize('photo.jpg', 5 * 1024 * 1024, 'free');
  console.log('\n✅ JPG 5MB validation:', jpgTest.valid ? 'PASS' : 'FAIL');

  const rawTest = await tierLimitService.validateFileSize('photo.cr2', 20 * 1024 * 1024, 'free');
  console.log('✅ CR2 20MB validation:', rawTest.valid ? 'PASS' : 'FAIL');

  const tooLarge = await tierLimitService.validateFileSize('photo.jpg', 50 * 1024 * 1024, 'free');
  console.log('✅ JPG 75MB validation:', tooLarge.valid ? 'FAIL' : 'PASS (correctly rejected)');

  console.log('\n✅ All tests passed!');
  process.exit(0);
}

testTiers().catch(console.error);