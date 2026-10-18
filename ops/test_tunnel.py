import pathlib
import tempfile
import unittest
from unittest.mock import Mock, patch

import tunnel


class OriginUpdateTests(unittest.TestCase):
    def test_initial_origin_is_private_and_untrusted_hosts_are_rejected(self):
        with tempfile.TemporaryDirectory() as folder, patch.object(tunnel, 'ROOT', pathlib.Path(folder)):
            (tunnel.ROOT / 'state').mkdir()
            self.assertTrue(tunnel.update_origin('https://qa-test.trycloudflare.com'))
            config = tunnel.ROOT / 'state/origin.env'
            self.assertEqual(config.read_text(), 'APP_ORIGIN=https://qa-test.trycloudflare.com\n')
            self.assertEqual(config.stat().st_mode & 0o777, 0o600)
            for origin in ['https://evil.example', 'https://qa.trycloudflare.com.evil.example', 'http://qa.trycloudflare.com']:
                with self.assertRaises(ValueError):
                    tunnel.update_origin(origin)

    def test_running_app_uses_serialized_idle_guard_and_defers_when_busy(self):
        with tempfile.TemporaryDirectory() as folder, patch.object(tunnel, 'ROOT', pathlib.Path(folder)), patch.object(tunnel.subprocess, 'run') as run:
            (tunnel.ROOT / 'current').mkdir()
            run.return_value = Mock(returncode=1)
            self.assertFalse(tunnel.update_origin('https://qa-test.trycloudflare.com'))
            self.assertIn('--refresh-origin', run.call_args.args[0])
            self.assertEqual(run.call_args.args[0][-1], '--origin=https://qa-test.trycloudflare.com')
            run.return_value = Mock(returncode=0)
            self.assertTrue(tunnel.update_origin('https://qa-test.trycloudflare.com'))


if __name__ == '__main__':
    unittest.main()
