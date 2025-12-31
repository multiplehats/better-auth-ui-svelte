import { db } from '../src/lib/server/db/index.js';
import { user } from '../src/lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Script to make a user an admin
 * Usage: tsx scripts/make-admin.ts <email>
 */

const email = process.argv[2];

if (!email) {
	console.error('❌ Please provide an email address');
	console.log('Usage: tsx scripts/make-admin.ts <email>');
	process.exit(1);
}

try {
	const result = await db
		.update(user)
		.set({ role: 'admin' })
		.where(eq(user.email, email))
		.returning();

	if (result.length === 0) {
		console.error(`❌ No user found with email: ${email}`);
		process.exit(1);
	}

	console.log('✅ Success! User is now an admin:');
	console.log(`   Email: ${result[0].email}`);
	console.log(`   Role: ${result[0].role}`);
	console.log(`   Name: ${result[0].name}`);

	process.exit(0);
} catch (error) {
	console.error('❌ Error updating user:', error);
	process.exit(1);
}
