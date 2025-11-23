/**
 * Database Seed Script
 * 
 * Populates the database with demo data for hackathon evaluation.
 * Run with: npm run seed
 * 
 * @module scripts/seed
 */

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const serverConfig = require('../server/server.config');

const pool = new Pool({
  connectionString: serverConfig.database.url,
  ssl: serverConfig.database.ssl ? { rejectUnauthorized: false } : false,
});

const DEMO_USER_ID = 'demo-user-001';
const DEMO_EMAIL = 'demo@focusflow.app';
const DEMO_PASSWORD = 'Demo123!@#';

/**
 * Generate demo data
 */
async function seed() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🌱 Seeding database with demo data...');
    
    // 1. Create demo user (if users table exists)
    try {
      const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 12);
      await client.query(`
        INSERT INTO users (id, email, password_hash, name, username, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          username = EXCLUDED.username
      `, [DEMO_USER_ID, DEMO_EMAIL, hashedPassword, 'Demo User', 'demo']);
      console.log('✅ Created demo user');
    } catch (error) {
      // Users table might not exist - that's okay
      console.log('⚠️  Users table not found, skipping user creation');
    }
    
    // 2. Insert focus modes
    const modes = [
      { name: 'Deep Work', slug: 'deep-work', duration: 90, description: 'Extended focused work session' },
      { name: 'Pomodoro', slug: 'pomodoro', duration: 25, description: 'Classic 25-minute focus session' },
      { name: 'Quick Focus', slug: 'quick-focus', duration: 15, description: 'Short burst of focused work' },
      { name: 'Long Session', slug: 'long-session', duration: 120, description: 'Extended 2-hour focus block' },
    ];
    
    for (const mode of modes) {
      await client.query(`
        INSERT INTO focus_modes (name, slug, duration_minutes, description, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          duration_minutes = EXCLUDED.duration_minutes,
          description = EXCLUDED.description
      `, [mode.name, mode.slug, mode.duration, mode.description]);
    }
    console.log('✅ Created focus modes');
    
    // 3. Create demo focus sessions (last 30 days)
    const now = new Date();
    const sessions = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Create 1-3 sessions per day
      const sessionsPerDay = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < sessionsPerDay; j++) {
        const startedAt = new Date(date);
        startedAt.setHours(9 + Math.floor(Math.random() * 8)); // 9 AM - 5 PM
        startedAt.setMinutes(Math.floor(Math.random() * 60));
        
        const duration = [15, 25, 50, 90][Math.floor(Math.random() * 4)];
        const endedAt = new Date(startedAt);
        endedAt.setMinutes(endedAt.getMinutes() + duration);
        
        const modeLabels = ['deep-work', 'pomodoro', 'quick-focus', 'long-session'];
        const modeLabel = modeLabels[Math.floor(Math.random() * modeLabels.length)];
        
        sessions.push({
          user_id: DEMO_USER_ID,
          mode_label: modeLabel,
          duration_minutes: duration,
          started_at: startedAt,
          expected_end: endedAt,
          ended_at: endedAt,
          interruption_count: Math.floor(Math.random() * 3),
        });
      }
    }
    
    for (const session of sessions) {
      await client.query(`
        INSERT INTO focus_sessions (
          user_id, mode_label, duration_minutes, started_at, expected_end, ended_at, interruption_count
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        session.user_id,
        session.mode_label,
        session.duration_minutes,
        session.started_at,
        session.expected_end,
        session.ended_at,
        session.interruption_count,
      ]);
    }
    console.log(`✅ Created ${sessions.length} demo focus sessions`);
    
    // 4. Create mode transitions
    const transitions = [];
    for (let i = 0; i < 50; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      date.setHours(Math.floor(Math.random() * 24));
      
      const modes = ['available', 'focus', 'break', 'meeting'];
      const previousMode = modes[Math.floor(Math.random() * modes.length)];
      const nextMode = modes[Math.floor(Math.random() * modes.length)];
      
      transitions.push({
        user_id: DEMO_USER_ID,
        previous_mode: previousMode,
        next_mode: nextMode,
        reason: ['User action', 'Auto-transition', 'Schedule'][Math.floor(Math.random() * 3)],
        created_at: date,
      });
    }
    
    for (const transition of transitions) {
      await client.query(`
        INSERT INTO mode_transitions (user_id, previous_mode, next_mode, reason, created_at)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        transition.user_id,
        transition.previous_mode,
        transition.next_mode,
        transition.reason,
        transition.created_at,
      ]);
    }
    console.log(`✅ Created ${transitions.length} mode transitions`);
    
    // 5. Create blocked messages
    const blockedMessages = [];
    for (let i = 0; i < 20; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 7));
      
      const channels = ['general', 'engineering', 'design', 'product', 'support'];
      const senders = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
      
      blockedMessages.push({
        user_id: DEMO_USER_ID,
        channel_id: channels[Math.floor(Math.random() * channels.length)],
        message_preview: `Message from ${senders[Math.floor(Math.random() * senders.length)]}: "Hey, can you help with..."`,
        created_at: date,
      });
    }
    
    for (const msg of blockedMessages) {
      await client.query(`
        INSERT INTO blocked_messages (user_id, channel_id, message_preview, created_at)
        VALUES ($1, $2, $3, $4)
      `, [msg.user_id, msg.channel_id, msg.message_preview, msg.created_at]);
    }
    console.log(`✅ Created ${blockedMessages.length} blocked messages`);
    
    // 6. Set current user mode
    await client.query(`
      INSERT INTO user_modes (user_id, current_mode, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        current_mode = EXCLUDED.current_mode,
        updated_at = NOW()
    `, [DEMO_USER_ID, 'available']);
    console.log('✅ Set demo user mode');
    
    await client.query('COMMIT');
    console.log('\n✨ Demo data seeded successfully!');
    console.log('\n📝 Demo Credentials:');
    console.log(`   Email: ${DEMO_EMAIL}`);
    console.log(`   Password: ${DEMO_PASSWORD}`);
    console.log(`   User ID: ${DEMO_USER_ID}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seed
seed()
  .then(() => {
    console.log('\n✅ Seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed script failed:', error);
    process.exit(1);
  });

