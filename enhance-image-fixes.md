// ============================================================================
// ENHANCE-IMAGE.TSX - FIXES FOR TIER-BASED USAGE INDICATOR
// ============================================================================
// 
// PROBLEM: Usage indicator "3/3 enhancements left" shows for ALL users including paid
// SOLUTION: Only show for FREE users, and only when limits are running low or exhausted
//
// ============================================================================

// STEP 1: Add helper function after line ~45 (after imports)
// ============================================================================

// Helper to check if user is on paid tier
const isPaidTier = (tier: string): boolean => {
  if (!tier) return false;
  const normalizedTier = tier.toLowerCase();
  return normalizedTier.includes('starter') || 
         normalizedTier.includes('pro') || 
         normalizedTier.includes('business') ||
         normalizedTier.includes('premium') ||
         normalizedTier.includes('paid');
};


// STEP 2: Add these variables after the useUpgradePrompt hook (around line 119)
// ============================================================================

  // Determine if user is on paid tier
  const userIsPaid = enhanceLimits ? isPaidTier(enhanceLimits.tier) : false;
  
  // For free users: check if limit reached
  const isLimitReached = !userIsPaid && enhanceLimits && enhanceLimits.remaining <= 0;


// STEP 3: REPLACE the usage indicator section (lines ~436-452)
// ============================================================================
// FIND THIS CODE:

          {/* Usage Display */}
          {enhanceLimits && (
            <div className="max-w-5xl mx-auto mb-8 space-y-4">
              <UsageIndicator
                feature="image_enhancement"
                used={enhanceLimits.limit - enhanceLimits.remaining}
                limit={enhanceLimits.limit}
                onUpgradeClick={() => upgradePrompt.setIsOpen(true)}
              />
              {enhanceLimits.remaining <= 0 && (
                <LimitReachedBanner
                  feature="image_enhancement"
                  onUpgradeClick={() => upgradePrompt.setIsOpen(true)}
                />
              )}
            </div>
          )}

// REPLACE WITH:

          {/* Limit Reached Banner - Only show for FREE users when limit is exhausted */}
          {isLimitReached && (
            <div className="max-w-5xl mx-auto mb-8">
              <LimitReachedBanner
                feature="image_enhancement"
                onUpgradeClick={() => upgradePrompt.setIsOpen(true)}
              />
            </div>
          )}


// STEP 4: Update the scale selection buttons to show restrictions for free users
// ============================================================================
// FIND the scale selection buttons (around line 750-762) and update them:

// REPLACE THIS:
                          {([2, 4, 8] as const).map(s => (
                            <button
                              key={s}
                              onClick={() => setScale(s)}
                              className={`p-6 rounded-2xl border-2 transition-all ${scale === s ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-gray-700 text-gray-400 hover:border-gray-500'
                                }`}
                            >
                              <div className="text-3xl font-black">{s}x</div>
                              <div className="text-xs font-bold opacity-60 uppercase">{s === 4 ? 'Best' : s === 8 ? 'Ultra' : 'Fast'}</div>
                            </button>
                          ))}

// WITH THIS:
                          {([2, 4, 8] as const).map(s => {
                            // For free users, restrict to 2x only
                            const isRestricted = !userIsPaid && s > 2;
                            
                            return (
                              <button
                                key={s}
                                onClick={() => {
                                  if (isRestricted) {
                                    upgradePrompt.showRestrictedFeaturePrompt(`${s}x upscale`);
                                  } else {
                                    setScale(s);
                                  }
                                }}
                                className={`p-6 rounded-2xl border-2 transition-all relative ${
                                  scale === s 
                                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' 
                                    : isRestricted
                                      ? 'border-gray-700/50 text-gray-600 cursor-not-allowed'
                                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                                }`}
                              >
                                <div className="text-3xl font-black">{s}x</div>
                                <div className="text-xs font-bold opacity-60 uppercase">
                                  {s === 4 ? 'Best' : s === 8 ? 'Ultra' : 'Fast'}
                                </div>
                                {isRestricted && (
                                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-black font-bold">★</span>
                                  </span>
                                )}
                              </button>
                            );
                          })}


// STEP 5: Update Face Enhancement toggle to show restriction for free users
// ============================================================================
// FIND the face enhancement button (around line 764-780) and update:

// REPLACE THIS:
                        <button
                          onClick={() => setFaceEnhance(!faceEnhance)}
                          className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${faceEnhance ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-gray-700 text-gray-400'
                            }`}
                        >

// WITH THIS:
                        <button
                          onClick={() => {
                            if (!userIsPaid) {
                              upgradePrompt.showRestrictedFeaturePrompt('Face Enhancement');
                            } else {
                              setFaceEnhance(!faceEnhance);
                            }
                          }}
                          className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all relative ${
                            faceEnhance 
                              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' 
                              : !userIsPaid
                                ? 'border-gray-700/50 text-gray-600'
                                : 'border-gray-700 text-gray-400'
                          }`}
                        >
                          {/* ...existing content... */}
                          {!userIsPaid && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-black font-bold">★</span>
                            </span>
                          )}


// STEP 6: Update the Process Button to check limits for free users
// ============================================================================
// FIND the process button (around line 799-810) and update:

// REPLACE THIS:
                        <Button
                          onClick={handleEnhanceImage}
                          disabled={isProcessing}
                          ...
                        >

// WITH THIS:
                        <Button
                          onClick={handleEnhanceImage}
                          disabled={isProcessing || isLimitReached}
                          size="lg"
                          className="w-full h-20 text-xl font-black bg-yellow-500 hover:bg-yellow-400 text-black rounded-3xl shadow-2xl shadow-yellow-500/20 disabled:opacity-50"
                        >
                          {isLimitReached ? (
                            'Limit Reached - Upgrade to Continue'
                          ) : isProcessing ? (
                            <><Loader2 className="w-8 h-8 mr-4 animate-spin" /> Processing AI...</>
                          ) : (
                            <><ZoomIn className="w-8 h-8 mr-4" /> Enhance Now</>
                          )}
                        </Button>


// ============================================================================
// SUMMARY OF CHANGES:
// ============================================================================
// 1. Added isPaidTier() helper function
// 2. Added userIsPaid and isLimitReached computed variables  
// 3. Removed UsageIndicator completely for paid users
// 4. Only show LimitReachedBanner for free users when limit exhausted
// 5. Added visual restrictions (★) on scale options 4x/8x for free users
// 6. Added visual restriction (★) on Face Enhancement for free users
// 7. Updated process button to show "Limit Reached" for free users
// ============================================================================
