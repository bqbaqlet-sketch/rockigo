"""Write a QR matrix for the local jury link read from standard input."""

import sys

from reportlab.graphics.barcode.qrencoder import QRCode, QRErrorCorrectLevel


code = QRCode(None, QRErrorCorrectLevel.M)
code.addData(sys.stdin.read().strip())
code.make()
width = code.getModuleCount()
padding = "0000"
for _ in range(4):
    print("0" * (width + 8))
for row in range(width):
    print(padding + "".join("1" if code.isDark(row, col) else "0" for col in range(width)) + padding)
for _ in range(4):
    print("0" * (width + 8))
