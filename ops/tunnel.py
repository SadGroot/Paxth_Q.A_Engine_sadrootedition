#!/usr/bin/env python3
"""Keep the preview URL and the application's exact allowed origin in sync."""
import fcntl
import os
import pathlib
import re
import signal
import subprocess
import time

ROOT = pathlib.Path('/opt/paxth-qa')
URL = re.compile(r'https://[a-z0-9-]+\.trycloudflare\.com')


def update_origin(origin):
    if not URL.fullmatch(origin):
        raise ValueError('Invalid preview origin')
    if (ROOT / 'current').exists():
        # Use the deployment lock and idle-queue guard for origin changes too.
        return subprocess.run(['/bin/bash', str(ROOT / 'ops/deploy.sh'), '--refresh-origin', '--origin=' + origin]).returncode == 0
    with (ROOT / 'state/deploy.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        temporary = ROOT / 'state/origin.env.next'
        temporary.write_text('APP_ORIGIN=' + origin + '\n')
        temporary.chmod(0o600)
        os.replace(temporary, ROOT / 'state/origin.env')
        (ROOT / 'state/url.txt').write_text(origin + '\n')
    return True


def main():
    process = subprocess.Popen(['/usr/local/bin/cloudflared', 'tunnel', '--no-autoupdate',
                                '--metrics', '127.0.0.1:20242', '--url', 'http://127.0.0.1:3200'],
                               stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
    signal.signal(signal.SIGTERM, lambda *_: process.terminate())
    try:
        for line in process.stdout:
            print(line.rstrip(), flush=True)
            match = URL.search(line)
            if match:
                origin = match.group()
                while process.poll() is None and not update_origin(origin):
                    print('Origin update deferred; retrying after active jobs or deployment.', flush=True)
                    time.sleep(15)
                print('Preview URL: ' + origin, flush=True)
        raise SystemExit(process.wait() or 1)
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()


if __name__ == '__main__':
    main()
