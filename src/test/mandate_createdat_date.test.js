import { describe, it, expect } from 'vitest';
import { dbStore } from '../../server/db/store.js';

describe('Mandate createdAt Date Object & Quota Resilience Suite', () => {
  it('countMonthlyMandates safely handles Date objects, numbers, and strings without throwing m.createdAt.startsWith is not a function', () => {
    const testRiaId = 'usr_ria_test_dates';
    const now = new Date();

    // Insert mandates with various createdAt representations
    dbStore.createMandate({
      id: 'man_test_date_obj',
      riaId: testRiaId,
      title: 'Mandate with native Date object',
      createdAt: new Date(), // JavaScript Date object
    });

    dbStore.createMandate({
      id: 'man_test_epoch_num',
      riaId: testRiaId,
      title: 'Mandate with epoch timestamp number',
      createdAt: Date.now(), // Number
    });

    dbStore.createMandate({
      id: 'man_test_iso_str',
      riaId: testRiaId,
      title: 'Mandate with ISO string',
      createdAt: now.toISOString(), // String
    });

    // Also manually inject a raw Date object into the map as MongoDB hydrated documents do
    dbStore.mandates.set('man_test_raw_mongo_date', {
      id: 'man_test_raw_mongo_date',
      riaId: testRiaId,
      title: 'Raw Mongo Date Object',
      createdAt: new Date(), // native Date instance
      status: 'draft',
    });

    // Expect countMonthlyMandates to NOT throw TypeError and return accurate count
    expect(() => {
      const count = dbStore.countMonthlyMandates(testRiaId);
      expect(count).toBeGreaterThanOrEqual(4);
    }).not.toThrow();

    // Clean up test mandates
    dbStore.mandates.delete('man_test_date_obj');
    dbStore.mandates.delete('man_test_epoch_num');
    dbStore.mandates.delete('man_test_iso_str');
    dbStore.mandates.delete('man_test_raw_mongo_date');
  });
});
