// Temporary global error handler to surface crash errors
const originalHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
  console.error('FATAL ERROR:', error?.message, error?.stack);
  if (originalHandler) {
    originalHandler(error, isFatal);
  }
});

require('expo-router/entry');
