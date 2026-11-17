import importlib.util
import pathlib
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('checkpoint', pathlib.Path(__file__).with_name('checkpoint-ledger.py'))
job = importlib.util.module_from_spec(spec)
spec.loader.exec_module(job)
INSTANCE = '00000000-0000-4000-8000-000000000001'


class CheckpointTests(unittest.TestCase):
    def setUp(self):
        self.anchor = dict(schema=1, instanceId=INSTANCE, headId='4', headHash='a' * 64)
        self.snapshot = dict(instanceId=INSTANCE, headId='6', headHash='b' * 64,
                             anchorHash='a' * 64, failures=0)

    def test_appended_events_preserve_checkpoint(self):
        job.compare(self.snapshot, self.anchor, INSTANCE)

    def test_consistent_rewrite_is_detected_by_external_anchor(self):
        self.snapshot['anchorHash'] = 'c' * 64
        with self.assertRaisesRegex(RuntimeError, 'external_checkpoint_mismatch'):
            job.compare(self.snapshot, self.anchor, INSTANCE)

    def test_truncated_ledger_is_detected(self):
        self.snapshot.update(headId='2', anchorHash=None)
        with self.assertRaises(RuntimeError):
            job.compare(self.snapshot, self.anchor, INSTANCE)

    def test_chain_corruption_blocks_checkpoint(self):
        self.snapshot['failures'] = 1
        with self.assertRaisesRegex(RuntimeError, 'ledger_chain_mismatch'):
            job.compare(self.snapshot, self.anchor, INSTANCE)

    def test_replaced_database_identity_is_detected(self):
        self.snapshot['instanceId'] = 'other'
        with self.assertRaisesRegex(RuntimeError, 'database_identity_mismatch'):
            job.compare(self.snapshot, self.anchor, INSTANCE)

    def test_untrusted_remote_head_cannot_become_sql(self):
        for bad in ('4;DROP TABLE security_ledger', '-1', '9223372036854775808'):
            with self.assertRaisesRegex(RuntimeError, 'invalid_checkpoint_head'):
                job.validate_anchor(dict(self.anchor, headId=bad), INSTANCE)

    def test_missing_remote_anchor_fails_closed(self):
        with patch.object(job, 'remote', return_value={'checkpoint': None}), patch.object(job, 'record') as record:
            self.assertEqual(job.main(INSTANCE), 1)
            record.assert_called_once_with(INSTANCE, 'failed', error='external_checkpoint_missing')

    def test_provider_failure_does_not_publish_verified(self):
        with patch.object(job, 'remote', side_effect=RuntimeError('provider_detail')), patch.object(job, 'record') as record:
            self.assertEqual(job.main(INSTANCE), 1)
            record.assert_called_once_with(INSTANCE, 'failed', error='checkpoint_unavailable')


if __name__ == '__main__':
    unittest.main()
