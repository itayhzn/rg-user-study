#!/usr/bin/env python3
"""
Local WiFi server for the pairwise user study.
Serves the current directory and prints the LAN IP so participants can connect.

Run from the pairwise-user-study/ directory:
  python scripts/serve.py [port]
"""

import http.server
import os
import socket
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080


def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'


def main():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    os.chdir(root)

    handler = http.server.SimpleHTTPRequestHandler
    # Suppress default request logging noise; keep errors
    handler.log_message = lambda self, fmt, *args: None

    with http.server.HTTPServer(('', PORT), handler) as httpd:
        ip = get_local_ip()
        print(f"\nPairwise User Study server running")
        print(f"  Local:   http://localhost:{PORT}")
        print(f"  Network: http://{ip}:{PORT}")
        print(f"\nShare the Network URL with participants on the same WiFi.")
        print("Press Ctrl+C to stop.\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")


if __name__ == '__main__':
    main()
