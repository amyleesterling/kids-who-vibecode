import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = sorted((ROOT / 'drizzle').glob('*.sql'))

assert MIGRATIONS[-1].name == '0018_year_round_program_and_shadow_ops.sql'

connection = sqlite3.connect(':memory:')
connection.execute('PRAGMA foreign_keys = ON')
for migration in MIGRATIONS[:-1]:
    connection.executescript(migration.read_text())

legacy_tables = [row[0] for row in connection.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
)]
before_counts = {table: connection.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0] for table in legacy_tables}
before_challenges = connection.execute('SELECT id, title FROM challenges ORDER BY id').fetchall()

connection.executescript(MIGRATIONS[-1].read_text())

after_counts = {table: connection.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0] for table in legacy_tables}
after_challenges = connection.execute('SELECT id, title FROM challenges ORDER BY id').fetchall()
assert before_counts == after_counts, '0018 changed legacy table row counts'
assert before_challenges == after_challenges, '0018 changed historical challenge records'

new_tables = {
    'challenge_programs', 'challenge_versions', 'challenge_reviews', 'challenge_content_packages',
    'review_policy_versions', 'review_runs', 'review_evidence', 'automated_decisions',
    'human_audits', 'operation_controls', 'social_content', 'social_approvals',
    'social_publications', 'campaign_drafts', 'aggregate_metrics', 'agent_runs',
}
actual_tables = {row[0] for row in connection.execute("SELECT name FROM sqlite_master WHERE type='table'")}
assert new_tables <= actual_tables

def must_fail(statement):
    try:
        connection.execute(statement)
    except sqlite3.IntegrityError:
        return
    raise AssertionError('Expected invariant to reject SQL: ' + statement)

must_fail("INSERT INTO campaign_drafts VALUES ('c','c','[]','{}','draft',1,NULL,'n','n')")
must_fail("INSERT INTO social_publications VALUES ('p','missing','live','simulated','{}',NULL,'n',NULL)")

print(f'Migration replay valid: {len(MIGRATIONS)} migrations applied; {len(legacy_tables)} legacy tables and all 2026 challenge rows preserved; off-switch constraints enforced.')
