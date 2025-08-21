// This file is for debugging module resolution only.

// Attempt to import the schema from the shared package.
import { branchSchema } from '@pos-terminal/schemas';

// If the import succeeds, this line will run.
console.log('✅ [RUNTIME TEST] Successfully imported branchSchema:', branchSchema.describe());